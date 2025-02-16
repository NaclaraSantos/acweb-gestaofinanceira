import jwtEncode from 'jwt-encode';
import { jwtDecode } from 'jwt-decode';

const SECRET_KEY = 'seu_secret_key_super_secreto_2024';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserWithPassword extends User {
  password: string;
}

interface JWTPayload {
  user: User;
  exp: number;
}

// Usuários mockados - agora é um array que pode ser modificado
let USERS: UserWithPassword[] = [
  {
    id: '1',
    email: 'teste@teste.com',
    password: '123456',
    name: 'Usuário Teste'
  }
];

export const register = (name: string, email: string, password: string): string | null => {
  // Verifica se já existe um usuário com este email
  if (USERS.some(u => u.email === email)) {
    return null;
  }

  // Cria novo usuário
  const newUser: UserWithPassword = {
    id: Date.now().toString(), // Gera um ID único
    email,
    password,
    name
  };

  // Adiciona ao array de usuários
  USERS.push(newUser);

  // Gera o token JWT
  const { password: _, ...userWithoutPassword } = newUser;
  
  const payload: JWTPayload = {
    user: userWithoutPassword,
    exp: Date.now() + (24 * 60 * 60 * 1000)
  };

  const token = jwtEncode(payload, SECRET_KEY);
  localStorage.setItem('auth_token', token);
  
  return token;
};

export const login = (email: string, password: string): string | null => {
  const user = USERS.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  
  const payload: JWTPayload = {
    user: userWithoutPassword,
    exp: Date.now() + (24 * 60 * 60 * 1000)
  };

  const token = jwtEncode(payload, SECRET_KEY);
  localStorage.setItem('auth_token', token);
  
  return token;
};

export const logout = () => {
  localStorage.removeItem('auth_token');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.exp > Date.now();
  } catch {
    return false;
  }
};

export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (decoded.exp > Date.now()) {
      return decoded.user;
    }
    return null;
  } catch {
    return null;
  }
};