export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  role?: 'USER' | 'ADMIN' | 'ONG' | string;
  dataCadastro?: string;
  foto?: string;
}

export interface Ong {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  tiposAceitos?: string | string[];
  horarios?: string | string[];
  aceitaColeta?: boolean;
  restricoes?: string;
  icon?: string;
  cor?: string;
  corClara?: string;
  fundacao?: string;
  pais?: string;
  sede?: string;
  site?: string;
  funcionarios?: string;
  sobre?: string;
  historia?: string;
  foto?: string;
  fotoCapa?: string;
  atuacao?: string[];
  numeros?: Array<{ valor: string; label: string }>;
}

export interface Doacao {
  id: number;
  nome: string;
  email: string;
  ong: Ong | string;
  ongId?: number;
  horario: string;
  data: string;
  usuarioId: number;
  itemDoado?: string;
  itensTipo?: string;
  status: 'AGENDADO' | 'DOACAO_ENTREGUE' | 'CANCELADO' | string;
  pinConfirmacao?: string;
  dataEntrega?: string;
  confirmadoPorUsuarioId?: number;
}

export interface DoacaoDTO {
  nome: string;
  email: string;
  ongId: number;
  horario: string;
  data: string;
  usuarioId: number;
  itemDoado?: string;
  itensTipo?: string;
}

export interface ChatMessage {
  id: number;
  usuario: 'paciente' | 'sistema' | 'usuario' | string;
  mensagem: string;
  data: string;
}

export interface ImpactStats {
  doacoesRealizadas: string;
  ongsParceiras: string;
  familiasAjudadas: string;
  gratuito: string;
}
