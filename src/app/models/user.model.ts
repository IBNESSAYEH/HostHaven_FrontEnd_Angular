
export interface User {
  id: string;
  firstName: string;
   lastName: string;
  email: string;
   phone: string;
  profile: string;
   role: 'ADMIN' | 'USER' | 'EMPLOYEE';
  emailVerificationStatus: boolean;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
   lastname: string;
  email: string;
   password: string;
  role?: 'ADMIN' | 'USER' | 'EMPLOYEE';
}

export interface AuthResponse {
   token: string;
}
