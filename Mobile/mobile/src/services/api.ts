import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Usuario, Ong, Doacao, DoacaoDTO, ChatMessage } from '@/types';
import { ONG_DETAILS } from '@/constants/data';

const STORAGE_KEY_API_URL = '@givenet_api_url';

// Endereço padrão inteligente
export const getDefaultApiUrl = (): string => {
  if (Platform.OS === 'android') {
    // Para emulador ou dispositivo na mesma rede
    return 'http://192.168.10.6:8080';
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:8080';
  }
  return 'http://192.168.10.6:8080';
};

export class ApiService {
  private static baseUrl: string = getDefaultApiUrl();
  private static initialized: boolean = false;

  public static async init() {
    if (this.initialized) return;
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_API_URL);
      if (saved) {
        this.baseUrl = saved;
      } else {
        this.baseUrl = getDefaultApiUrl();
      }
    } catch {
      this.baseUrl = getDefaultApiUrl();
    }
    this.initialized = true;
  }

  public static async setBaseUrl(url: string): Promise<void> {
    let clean = url.trim();
    if (clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `http://${clean}`;
    }
    this.baseUrl = clean;
    await AsyncStorage.setItem(STORAGE_KEY_API_URL, clean);
  }

  public static getBaseUrl(): string {
    return this.baseUrl;
  }

  public static async testConnection(url?: string): Promise<{ ok: boolean; message: string }> {
    const target = url || this.baseUrl;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${target}/ongs`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return { ok: true, message: 'Conexão com backend estabelecida com sucesso!' };
      }
      return { ok: false, message: `Backend respondeu com status ${res.status}` };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Falha ao conectar no servidor' };
    }
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.init();
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        let errorText = '';
        try {
          const jsonErr = await response.json();
          errorText = jsonErr.message || JSON.stringify(jsonErr);
        } catch {
          errorText = await response.text();
        }
        throw new Error(errorText || `Erro na requisição (${response.status})`);
      }

      if (response.status === 204) {
        return null as unknown as T;
      }

      const text = await response.text();
      return text ? (JSON.parse(text) as T) : (null as unknown as T);
    } catch (err: any) {
      clearTimeout(timeout);
      throw err;
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

  public static async getUsuario(id: number, solicitanteId: number): Promise<Usuario> {
    return this.request<Usuario>(`/usuarios/${id}`, {
      headers: { usuarioId: String(solicitanteId) },
    });
  }

  // ==== ONGS ====
  public static async getOngs(): Promise<Ong[]> {
    try {
      const backendOngs = await this.request<Ong[]>('/ongs');
      if (backendOngs && backendOngs.length > 0) {
        return backendOngs.map((o) => {
          const detail = ONG_DETAILS[o.nome] || {};
          return {
            ...detail,
            ...o,
            icon: detail.icon || '🏢',
            cor: detail.cor || '#7c3aed',
            corClara: detail.corClara || '#ede9fe',
            sobre: o.restricoes ? `${o.restricoes}. ${detail.sobre || ''}` : detail.sobre || 'ONG Parceira GiveNet',
            tiposAceitos: Array.isArray(o.tiposAceitos)
              ? o.tiposAceitos
              : typeof o.tiposAceitos === 'string'
              ? (o.tiposAceitos as string).split(',').map((t: string) => t.trim())
              : detail.tiposAceitos || ['Alimentos', 'Roupas'],
            horarios: Array.isArray(o.horarios)
              ? o.horarios
              : typeof o.horarios === 'string'
              ? (o.horarios as string).split(',').map((h: string) => h.trim())
              : detail.horarios || ['09:00', '14:00'],
          };
        });
      }
    } catch (e) {
      console.warn('Usando lista estática de ONGs por fallback:', e);
    }

    // Fallback caso backend não tenha dados ainda
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
    } catch {
      const all = await this.getOngs();
      return all.find((o) => o.id === id) || all[0];
    }
  }

  // ==== DOAÇÕES ====
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

  public static async criarDoacao(dto: DoacaoDTO): Promise<Doacao> {
    return this.request<Doacao>('/doacoes', {
      method: 'POST',
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
    options: {
      pin?: string;
      adminEmail?: string;
      adminSenha?: string;
      usuarioId?: number;
      usuarioSenha?: string;
    }
  ): Promise<Doacao> {
    const headers: Record<string, string> = {};
    if (options.usuarioId) headers.usuarioId = String(options.usuarioId);
    if (options.adminEmail) headers.adminEmail = options.adminEmail;
    if (options.adminSenha) headers.adminSenha = options.adminSenha;
    if (options.usuarioSenha) headers.usuarioSenha = options.usuarioSenha;

    const query = options.pin ? `?pin=${encodeURIComponent(options.pin)}` : '';
    return this.request<Doacao>(`/doacoes/${id}/confirmar-entrega${query}`, {
      method: 'PATCH',
      headers,
    });
  }

  // ==== CHAT ====
  public static async getChatMensagens(): Promise<ChatMessage[]> {
    try {
      return await this.request<ChatMessage[]>('/chat');
    } catch {
      return [];
    }
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
