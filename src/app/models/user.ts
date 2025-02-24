export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  token: string;
}


export interface AuthRes{
    id?: number;
    username: string;
    phone?: string;
    email: string;
    token: string;
    refreshToken: string
}
export interface AuthUser{
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
  age: number;
  monthlyIncome: number | null;
  creditScore: number;
  totalSolde: number | null;
  role: 'ADMIN' | 'USER';
}
