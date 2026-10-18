import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Usuario, Ong, Doacao, DoacaoDTO, DoacaoStatusHistory, ChatMessage } from '@/types';
import { ONG_DETAILS } from '@/constants/data';

const STORAGE_KEY_API_URL = '@givenet_api_url';
export const STORAGE_KEY_TOKEN = '@givenet_token';
const API_REQUEST_TIMEOUT_MS = 30_000;
const CONNECTION_TIMEOUT_MS = 10_000;

class ApiConnectionError extends Error {}

class ApiHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

const isLoopbackHost = (host: string): boolean => {
  const normalizedHost = host.toLowerCase().replace(/^\[|\]$/g, '');
  return (
    normalizedHost === 'localhost' ||
    normalizedHost === '::1' ||
    normalizedHost.startsWith('127.')
  );
};

const isPrivateIpv4Host = (host: string): boolean => {
  const octets = host.split('.');
  if (
    octets.length !== 4 ||
    octets.some((octet) => !/^\d+$/.test(octet) || Number(octet) > 255)
  ) {
    return false;
  }
  const [first, second] = octets.map(Number);

  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
};

const isAndroidLoopbackUrl = (url: string): boolean => {
  try {
    return isLoopbackHost(new URL(url).hostname);
  } catch {
    return false;
  }
};

const normalizeApiUrl = (url: string): string => {
  let clean = url.trim();
  if (!clean) {
    throw new Error('Configure o endereço do backend GiveNet antes de fazer requisições.');
  }
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `http://${clean}`;
  }
  clean = clean.replace(/\/+$/, '');

  let parsed: URL;
  try {
    parsed = new URL(clean);
  } catch {
    throw new Error('Endereço do backend inválido. Informe um endereço HTTP ou HTTPS válido.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('O endereço do backend deve usar HTTP ou HTTPS.');
  }
  if (Platform.OS === 'android' && isLoopbackHost(parsed.hostname)) {
    throw new Error(
      'No Android, informe o IP do computador na rede Wi-Fi; localhost aponta para o próprio celular.'
    );
  }

  return clean;
};

const getExpoHost = (): string | null => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;

  return hostUri.replace(/:\d+$/, '') || null;
};

// Endereço padrão inteligente
export const getDefaultApiUrl = (): string => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredUrl) {
    return normalizeApiUrl(configuredUrl);
  }

  if (Platform.OS === 'android') {
    // Only use Expo's host when it is a private LAN address; tunnel hosts are not the API host.
    const expoHost = getExpoHost();
    if (expoHost && isPrivateIpv4Host(expoHost)) {
      return `http://${expoHost}:8080`;
    }

    // Sem o host do Expo, não é possível inferir o IP do computador em um aparelho físico.
    return '';
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:8080';
  }
  // iOS simulator
  return 'http://localhost:8080';
};

export class ApiService {
  private static baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || getDefaultApiUrl();
  private static initialized: boolean = false;

  public static async init() {
    if (this.initialized) return;
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_API_URL);
      const defaultUrl = getDefaultApiUrl();
      const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
      if (configuredUrl) {
        this.baseUrl = normalizeApiUrl(configuredUrl);
      } else if (
        saved &&
        !(Platform.OS === 'android' && isAndroidLoopbackUrl(saved))
      ) {
        this.baseUrl = normalizeApiUrl(saved);
      } else if (saved) {
        this.baseUrl = defaultUrl;
        await AsyncStorage.setItem(STORAGE_KEY_API_URL, defaultUrl);
      } else {
        this.baseUrl = defaultUrl;
      }
    } catch (error) {
      console.warn('Não foi possível carregar a configuração da API:', error);
      this.baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ? '' : getDefaultApiUrl();
    }
    this.initialized = true;
  }

  public static async setBaseUrl(url: string): Promise<void> {
    const clean = normalizeApiUrl(url);
    this.baseUrl = clean;
    await AsyncStorage.setItem(STORAGE_KEY_API_URL, clean);
  }

  public static getBaseUrl(): string {
    return this.baseUrl;
  }

  public static async testConnection(url?: string): Promise<{ ok: boolean; message: string }> {
    let target: string;
    try {
      target = normalizeApiUrl(url || this.baseUrl);
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : String(error) };
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT_MS);
    try {
      const res = await fetch(`${target}/ongs`, {
        signal: controller.signal,
      });
      if (res.ok) {
        return { ok: true, message: 'Conexão com backend estabelecida com sucesso!' };
      }
      return { ok: false, message: `Backend respondeu com status ${res.status}` };
    } catch (error) {
      if (controller.signal.aborted) {
        return {
          ok: false,
          message: `Tempo limite de ${CONNECTION_TIMEOUT_MS / 1000}s excedido ao conectar com ${target}.`,
        };
      }
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Falha ao conectar no servidor',
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.init();
    if (!this.baseUrl) {
      throw new Error(
        'Endereço do backend não identificado. Configure EXPO_PUBLIC_API_URL ou informe o IP do computador na rede Wi-Fi.'
      );
    }
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    const method = (options.method || 'GET').toUpperCase();
    const path = endpoint.split('?')[0];
    const isPublicRequest =
      (method === 'POST' && (path === '/usuarios' || path === '/usuarios/login')) ||
      (method === 'POST' && path === '/ongs/solicitacoes') ||
      (method === 'GET' && (path === '/ongs' || /^\/ongs\/\d+$/.test(path))) ||
      ((method === 'GET' || method === 'POST') && /^\/chat(?:\/\d+)?$/.test(path));

    if (!isPublicRequest) {
      const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = errorText || `Erro na requisição (${response.status})`;
        try {
          const jsonError: unknown = JSON.parse(errorText);
          if (typeof jsonError === 'object' && jsonError !== null && 'message' in jsonError) {
            const apiMessage = jsonError.message;
            if (typeof apiMessage === 'string') message = apiMessage;
          }
        } catch {
          // Respostas de erro podem ser texto simples em vez de JSON.
        }
        throw new ApiHttpError(message, response.status);
      }

      if (response.status === 204) {
        return null as unknown as T;
      }

      const text = await response.text();
      return text ? (JSON.parse(text) as T) : (null as unknown as T);
    } catch (error) {
      if (error instanceof ApiHttpError) {
        throw error;
      }
      if (controller.signal.aborted) {
        throw new ApiConnectionError(
          `Tempo limite de ${API_REQUEST_TIMEOUT_MS / 1000}s excedido ao acessar ${url}.`
        );
      }
      if (error instanceof SyntaxError) {
        throw new Error(`A API retornou uma resposta JSON inválida para ${url}.`);
      }
      throw new ApiConnectionError(
        `Falha de comunicação com ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  // ==== AUTH & USUARIOS ====
  public static async login(email: string, senha: string): Promise<Usuario> {
    return this.request<Usuario>('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
  }

  public static async cadastrar(data: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    role?: string;
  }): Promise<Usuario> {
    return this.request<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static async solicitarCadastroOng(data: {
    nome: string;
    cnpj: string;
    email: string;
    telefone: string;
    endereco: string;
    responsavelNome: string;
    senha: string;
    tiposAceitos: string;
    horarios: string;
  }): Promise<void> {
    await this.request<void>('/ongs/solicitacoes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static async getUsuario(id: number, solicitanteId: number): Promise<Usuario> {
    return this.request<Usuario>(`/usuarios/${id}`, {
      headers: { usuarioId: String(solicitanteId) },
    });
  }

  public static async atualizarPerfil(
    id: number,
    data: { nome: string; telefone?: string; senhaAtual: string; novaSenha?: string }
  ): Promise<Usuario> {
    return this.request<Usuario>(`/usuarios/${id}/perfil`, {
      method: 'PUT',
      headers: { usuarioId: String(id) },
      body: JSON.stringify(data),
    });
  }

  // ==== ONGS ====
  public static async getOngs(): Promise<Ong[]> {
    try {
      const backendOngs = await this.request<Ong[]>('/ongs');
      return (backendOngs || []).map((o) => {
        const detail = ONG_DETAILS[o.nome] || {};
        return {
          ...detail,
          ...o,
          icon: detail.icon || '🏢',
          cor: detail.cor || '#7c3aed',
          corClara: detail.corClara || '#ede9fe',
          sobre:
            o.sobre ||
            (o.restricoes
              ? `${o.restricoes}. ${detail.sobre || ''}`
              : detail.sobre || 'ONG Parceira GiveNet'),
          tiposAceitos: Array.isArray(o.tiposAceitos)
            ? o.tiposAceitos
            : typeof o.tiposAceitos === 'string'
              ? o.tiposAceitos.split(',').map((t: string) => t.trim())
              : detail.tiposAceitos || ['Alimentos', 'Roupas'],
          horarios: Array.isArray(o.horarios)
            ? o.horarios
            : typeof o.horarios === 'string'
              ? o.horarios.split(',').map((h: string) => h.trim())
              : detail.horarios || ['09:00', '14:00'],
        };
      });
    } catch (error) {
      if (!(error instanceof ApiConnectionError)) {
        throw error;
      }
      console.warn('API de ONGs indisponível; usando lista estática de fallback:', error);
    }

    return Object.keys(ONG_DETAILS).map((nome, index) => ({
      id: index + 1,
      nome,
      ...ONG_DETAILS[nome],
    }));
  }

  public static async getOng(id: number): Promise<Ong> {
    try {
      const o = await this.request<Ong>(`/ongs/${id}`);
      const detail = ONG_DETAILS[o.nome] || {};
      return { ...detail, ...o };
    } catch (error) {
      if (!(error instanceof ApiConnectionError)) {
        throw error;
      }
      const all = await this.getOngs();
      const ong = all.find((item) => item.id === id);
      if (!ong) {
        throw new Error(`ONG ${id} não encontrada no fallback local.`);
      }
      return ong;
    }
  }

  // ==== DOAÇÕES ====
  public static async getHistoricoStatus(doacaoId: number, usuarioId: number): Promise<DoacaoStatusHistory[]> {
    return this.request<DoacaoStatusHistory[]>(`/doacoes/historico/${doacaoId}`, {
      headers: { usuarioId: String(usuarioId) },
    });
  }

  public static async getDoacoesUsuario(usuarioId: number): Promise<Doacao[]> {
    return this.request<Doacao[]>(`/doacoes/usuario/${usuarioId}`, {
      headers: { usuarioId: String(usuarioId) },
    });
  }

  public static async getDoacao(id: number, usuarioId: number): Promise<Doacao> {
    return this.request<Doacao>(`/doacoes/${id}`, {
      headers: { usuarioId: String(usuarioId) },
    });
  }

  public static async buscarDoacoes(filtros: {
    nome?: string;
    item?: string;
    data?: string;
    horario?: string;
    id?: string;
  }): Promise<Doacao[]> {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([campo, valor]) => {
      if (valor?.trim()) {
        params.set(campo, valor.trim());
      }
    });

    return this.request<Doacao[]>(`/doacoes/buscar?${params.toString()}`);
  }

  public static async criarDoacao(dto: DoacaoDTO): Promise<Doacao> {
    return this.request<Doacao>('/doacoes', {
      method: 'POST',
      headers: { usuarioId: String(dto.usuarioId) },
      body: JSON.stringify(dto),
    });
  }

  public static async atualizarDoacao(
    id: number,
    usuarioId: number,
    dto: Partial<DoacaoDTO>
  ): Promise<Doacao> {
    return this.request<Doacao>(`/doacoes/${id}`, {
      method: 'PUT',
      headers: { usuarioId: String(usuarioId) },
      body: JSON.stringify(dto),
    });
  }

  public static async cancelarDoacao(id: number, usuarioId: number): Promise<Doacao> {
    return this.request<Doacao>(`/doacoes/${id}/cancelar`, {
      method: 'PATCH',
      headers: { usuarioId: String(usuarioId) },
    });
  }

  public static async deletarDoacao(id: number, usuarioId: number): Promise<void> {
    return this.request<void>(`/doacoes/${id}`, {
      method: 'DELETE',
      headers: { usuarioId: String(usuarioId) },
    });
  }

  public static async confirmarEntrega(
    id: number,
    options: { pin?: string }
  ): Promise<Doacao> {
    const query = options.pin ? `?pin=${encodeURIComponent(options.pin)}` : '';
    return this.request<Doacao>(`/doacoes/${id}/confirmar-entrega${query}`, {
      method: 'PATCH',
    });
  }

  // ==== CHAT ====
  public static async getChatMensagens(): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>('/chat');
  }

  public static async enviarChatMensagem(
    mensagem: string,
    usuario: string = 'paciente'
  ): Promise<ChatMessage> {
    return this.request<ChatMessage>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        usuario,
        mensagem,
        data: new Date().toISOString(),
      }),
    });
  }
}
