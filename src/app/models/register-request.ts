export enum Role {
  GUEST = 'GUEST',
  HOST = 'HOST',
  ADMIN = 'ADMIN',
   MODERATOR = 'MODERATOR',
  SUPER_HOST = 'SUPER_HOST',
  PHOTOGRAPHER = 'PHOTOGRAPHER',
  CONTENT_REVIEWER = 'CONTENT_REVIEWER',
   TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
   PAYMENT_MANAGER = 'PAYMENT_MANAGER',
  QUALITY_CHECKER = 'QUALITY_CHECKER',
  TRANSLATOR = 'TRANSLATOR',
  ACCOUNTING = 'ACCOUNTING'
}

export interface RegisterRequest {
  firstname: string;
   lastname: string;
  email: string;
    password: string;
  role: Role;
}
