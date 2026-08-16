import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '@/types';
import { ApiService } from '@/services/api';

interface AuthContextData {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOng: boolean;
  apiUrl: string;
  login: (email: string, senha: string) => Promise<Usuario>;
  cadastrar: (data: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    role?: string;
  }) => Promise<Usuario>;
  logout: () => Promise<void>;
  atualizarFoto: (fotoUri: string) => Promise<void>;
  updateApiUrl: (url: string) => Promise<{ ok: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const STORAGE_KEY_USER = '@givenet_usuario';
const STORAGE_KEY_FOTO = '@givenet_foto_';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    async function loadStorageData() {
      try {
        await ApiService.init();
        setApiUrl(ApiService.getBaseUrl());

        const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) {
          const parsedUser: Usuario = JSON.parse(storedUser);
          const userPhoto = await AsyncStorage.getItem(`${STORAGE_KEY_FOTO}${parsedUser.id}`);
          if (userPhoto) {
            parsedUser.foto = userPhoto;
          }
          setUsuario(parsedUser);
        }
      } catch (e) {
        console.error('Erro ao carregar dados do usuário:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const login = async (email: string, senha: string): Promise<Usuario> => {
    setIsLoading(true);
    try {
      const user = await ApiService.login(email, senha);
      const userPhoto = await AsyncStorage.getItem(`${STORAGE_KEY_FOTO}${user.id}`);
      if (userPhoto) {
        user.foto = userPhoto;
      }
      setUsuario(user);
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const cadastrar = async (data: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    role?: string;
  }): Promise<Usuario> => {
    setIsLoading(true);
    try {
      const novoUsuario = await ApiService.cadastrar(data);
      return novoUsuario;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setUsuario(null);
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
  };

  const atualizarFoto = async (fotoUri: string): Promise<void> => {
    if (!usuario) return;
    const updated = { ...usuario, foto: fotoUri };
    setUsuario(updated);
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    await AsyncStorage.setItem(`${STORAGE_KEY_FOTO}${usuario.id}`, fotoUri);
  };

  const updateApiUrl = async (url: string): Promise<{ ok: boolean; message: string }> => {
    try {
      await ApiService.setBaseUrl(url);
      setApiUrl(ApiService.getBaseUrl());
      const test = await ApiService.testConnection(url);
      return test;
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Erro ao definir URL' };
    }
  };

  const isAdmin = usuario?.role === 'ADMIN';
  const isOng = usuario?.role === 'ONG';
  const isAuthenticated = !!usuario?.id;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        isAuthenticated,
        isAdmin,
        isOng,
        apiUrl,
        login,
        cadastrar,
        logout,
        atualizarFoto,
        updateApiUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
