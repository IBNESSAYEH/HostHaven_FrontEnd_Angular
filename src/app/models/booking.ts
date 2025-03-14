export interface BookingRequest {
  annonceId: string;
   customerId: string;
  amount: number;
  currency: string;
   description: string;
  startDate: number;
  endDate: number;
}

export interface PaymentResponse {
  paymentIntentId: string;
   clientSecret: string;
  status: string;
   amount: number;
  currency: string;
}

export interface Booking {
  id: string;
  annonceId: string;
   userId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
   status: string;
  createdAt: Date;
  stripePaymentIntentId: string;
}
