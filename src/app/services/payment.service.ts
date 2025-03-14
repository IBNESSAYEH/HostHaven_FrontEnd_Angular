import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare var Stripe: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api/payments';
  private stripe: any;

  constructor(private http: HttpClient) {
    this.initStripe();
  }

  private initStripe() {
    try {
      this.stripe = Stripe('pk_test_51Oqj47P1446qtX6xeYqDoXN1VMbWvrJhDB15t2GfBrLOW9S12cY7Z5BHTyXygzBav81kncRqvb4Mfu45zIC85yiT00EJ9V38j3');
         console.log('Stripe initialized successfully');
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }

  createPaymentIntent(paymentRequest: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-payment-intent`, paymentRequest);
  }

    confirmPayment(paymentIntentId: string): Observable<any> {
     return this.http.post<any>(`${this.apiUrl}/confirm/${paymentIntentId}`, {});
  }

  setupStripeElements(clientSecret: string, elementId: string): any {
    try {
      if (!this.stripe) {
        this.initStripe();
      }

      console.log('Setting up Stripe elements with client secret');

      const elements = this.stripe.elements({
        clientSecret: clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0570de',
            colorBackground: '#ffffff',
            colorText: '#30313d',
             colorDanger: '#df1b41',
            fontFamily: 'Ideal Sans, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '4px'
          }
        },
        locale: 'auto'
      });

      const paymentElement = elements.create('payment', {
        layout: {
          type: 'tabs',
          defaultCollapsed: false
        }
      });

      console.log('Payment element created, preparing to mount');

      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          paymentElement.mount(`#${elementId}`);
          console.log('Payment element mounted successfully to', elementId);
        } else {
          console.error(`Element with id "${elementId}" not found`);
        }
      }, 500);

      return elements;
    } catch (error) {
      console.error('Error setting up Stripe elements:', error);
      return null;
    }
  }

  async confirmStripePayment(elements: any, clientSecret: string): Promise<{error?: any, paymentIntent?: any}> {
    if (!this.stripe) {
      this.initStripe();
    }

    console.log('Beginning payment confirmation process');

    try {
      const result = await this.stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/booking-success'
        },
        redirect: 'if_required'
      });

      if (result.error) {
        console.error('Payment confirmation error:', result.error);
        return { error: result.error };
      } else {
        console.log('Payment confirmation success:', result.paymentIntent);
        return { paymentIntent: result.paymentIntent };
      }
    } catch (error) {
      console.error('Exception during payment confirmation:', error);
      return { error: { message: 'An unexpected error occurred during payment confirmation.' } };
    }
  }

  getPublicKey(): string {
    return 'pk_test_51Oqj47P1446qtX6xeYqDoXN1VMbWvrJhDB15t2GfBrLOW9S12cY7Z5BHTyXygzBav81kncRqvb4Mfu45zIC85yiT00EJ9V38j3';
  }
}
