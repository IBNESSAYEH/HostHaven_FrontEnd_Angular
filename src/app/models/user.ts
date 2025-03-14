export interface User {
  id: number;
  username: string;
   email: string;
  phone?: string;
  token: string;
}

export interface AuthRes {
  id?: number;
  username: string;
   phone?: string;
  email: string;
  token: string;
  refreshToken: string
}

export interface AuthUser {
  id?: number;
   username: string;
  phone?: string;
  email: string;
}

export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
   email: string;
  phone: string;
  emailVerificationStatus?: boolean;
  age?: number;
   monthlyIncome?: number | null;
  creditScore?: number;
  totalSolde?: number | null;
  inscriptionDate?: string;
  role: 'ADMIN' | 'USER' | 'HOST' | 'GUEST' | 'SUPER_HOST';
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
    email: string;
  phone: string;
   role: 'ADMIN'   | 'USER' |  'HOST' | 'GUEST' |  'SUPER_HOST';
  emailVerificationStatus: boolean;
  inscriptionDate: string;
}
