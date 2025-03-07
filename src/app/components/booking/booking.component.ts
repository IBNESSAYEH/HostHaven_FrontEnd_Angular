import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Annonce } from '../../models/annonce';
import { AnnonceService } from '../../services/annonce.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { BookingRequest } from '../../models/booking';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit, AfterViewInit {
  annonce: Annonce | null = null;
  bookingForm: FormGroup;
  isLoading = true;
  error: string | null = null;
  totalPrice = 0;
  numberOfDays = 0;
  paymentProcessing = false;
  stripeElements: any;
  clientSecret: string | null = null;
  currentDate: string;
  paymentElementMounted = false;
  processingPayment = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private annonceService: AnnonceService,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {
    this.bookingForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });

    this.currentDate = this.formatDateForInput(new Date());
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to book a property',
        icon: 'warning',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: this.router.url }
        });
      });
      return;
    }

    this.route.params.subscribe(params => {
      const id = params['id'];
      this.loadProperty(id);
    });

    const user = this.authService.userSubject?.getValue();
    if (user) {
      this.bookingForm.patchValue({
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
        phone: user.phone || ''
      });
    }
  }

  ngAfterViewInit() {
    // Add a listener for when payment elements are added to DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && document.getElementById('payment-element')) {
          console.log('Payment element container detected in DOM');
          this.setupPaymentElement();
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private setupPaymentElement() {
    if (this.clientSecret && !this.paymentElementMounted) {
      console.log('Setting up payment element with client secret');
      setTimeout(() => {
        const paymentElement = document.getElementById('payment-element');
        if (paymentElement) {
          console.log('Payment element container found, mounting Stripe element');
          this.stripeElements = this.paymentService.setupStripeElements(this.clientSecret!, 'payment-element');
          this.paymentElementMounted = true;
        } else {
          console.error('Payment element container not found in DOM');
        }
      }, 800); // Increased delay for better reliability
    }
  }

  private loadProperty(id: string) {
    this.isLoading = true;
    this.annonceService.getById(id).subscribe({
      next: (data) => {
        this.annonce = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load property details';
        this.isLoading = false;
        Swal.fire('Error', this.error, 'error');
      }
    });
  }

  onDateChange() {
    if (this.bookingForm.get('startDate')?.valid && this.bookingForm.get('endDate')?.valid && this.annonce) {
      const start = new Date(this.bookingForm.value.startDate);
      const end = new Date(this.bookingForm.value.endDate);

      const timeDiff = end.getTime() - start.getTime();
      this.numberOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (this.numberOfDays <= 0) {
        this.bookingForm.get('endDate')?.setErrors({ invalidRange: true });
        this.totalPrice = 0;
        return;
      }

      if (this.numberOfDays >= 30) {
        const months = Math.ceil(this.numberOfDays / 30);
        this.totalPrice = this.annonce.monthPrice * months;
      } else if (this.numberOfDays >= 7) {
        const weeks = Math.ceil(this.numberOfDays / 7);
        this.totalPrice = this.annonce.weekPrice * weeks;
      } else {
        this.totalPrice = this.annonce.dayPrice * this.numberOfDays;
      }

      this.totalPrice = isNaN(this.totalPrice) ? 0 : this.totalPrice;
    } else {
      this.totalPrice = 0;
      this.numberOfDays = 0;
    }
  }

  async onSubmit() {
    if (this.bookingForm.valid && this.annonce) {
      const userId = this.authService.getUserId();
      if (!userId) {
        Swal.fire('Error', 'User ID not found. Please log in again.', 'error');
        return;
      }

      this.paymentProcessing = true;

      try {
        const startDate = new Date(this.bookingForm.value.startDate);
        const endDate = new Date(this.bookingForm.value.endDate);

        const bookingRequest: BookingRequest = {
          annonceId: this.annonce.id,
          customerId: userId,
          amount: Math.round(this.totalPrice * 100),
          currency: 'usd',
          description: `Booking for ${this.annonce.title} from ${this.formatDateForDisplay(startDate)} to ${this.formatDateForDisplay(endDate)}`,
          startDate: Math.floor(startDate.getTime() / 1000),
          endDate: Math.floor(endDate.getTime() / 1000)
        };

        console.log('Creating payment intent with request:', bookingRequest);

        const paymentResponse = await this.paymentService.createPaymentIntent(bookingRequest).toPromise();

        if (!paymentResponse || !paymentResponse.clientSecret) {
          throw new Error('Failed to get client secret from payment response');
        }

        console.log('Payment intent created successfully with client secret');
        this.clientSecret = paymentResponse.clientSecret;

        Swal.fire({
          title: 'Booking Initialized',
          text: 'Please complete payment to confirm your booking',
          icon: 'success',
          confirmButtonText: 'Proceed to Payment'
        }).then(() => {
          const paymentSection = document.getElementById('payment-section');
          if (paymentSection) {
            paymentSection.scrollIntoView({ behavior: 'smooth' });
            this.setupPaymentElement();
          }
        });
      } catch (error) {
        console.error('Payment initialization error:', error);
        Swal.fire('Error', 'Failed to initialize payment. Please try again.', 'error');
        this.paymentProcessing = false;
      }
    } else {
      this.markFormGroupTouched(this.bookingForm);
    }
  }

  async processPayment() {
    console.log('Process payment clicked, elements:', this.stripeElements);
    console.log('Client secret:', this.clientSecret ? 'Available' : 'Not available');

    if (!this.stripeElements || !this.clientSecret) {
      Swal.fire('Error', 'Payment not initialized properly', 'error');
      return;
    }

    this.processingPayment = true;

    try {
      Swal.fire({
        title: 'Processing Payment',
        text: 'Please wait while we process your payment...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const result = await this.paymentService.confirmStripePayment(
        this.stripeElements,
        this.clientSecret
      );

      if (result.error) {
        console.error('Payment confirmation error:', result.error);
        Swal.fire('Payment Failed', result.error.message || 'Payment could not be processed', 'error');
      } else {
        console.log('Payment confirmation successful:', result.paymentIntent);
        Swal.fire({
          title: 'Booking Confirmed!',
          text: 'Your payment was successful and booking is confirmed',
          icon: 'success',
          confirmButtonText: 'View My Bookings'
        }).then(() => {
          this.router.navigate(['/bookings']);
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Swal.fire('Error', 'An error occurred while processing your payment', 'error');
    } finally {
      this.processingPayment = false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getPropertyImageUrl(): string {
    if (this.annonce && this.annonce.images && this.annonce.images.length > 0) {
      return this.annonce.images[0].imageURL;
    }
    return 'assets/images/placeholder-property.jpg';
  }
}
