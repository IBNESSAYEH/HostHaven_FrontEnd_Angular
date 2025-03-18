import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

interface Review {
  id: string;
  stars: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  annonceId: string;
}

@Component({
  selector: 'app-property-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './property-reviews.component.html',
  styleUrls: ['./property-reviews.component.scss']
})
export class PropertyReviewsComponent implements OnInit {
  @Input() annonceId: string = '';

  reviews: Review[] = [];
  averageRating: number = 0;
  isLoading: boolean = false;
  error: string = '';
  Math = Math;

  newReview = {
    stars: 5,
    annonceId: ''
  };

  constructor(
    private http: HttpClient,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.annonceId) {
      this.loadReviews();
      this.loadAverageRating();
    }
  }

  private loadReviews(): void {
    this.isLoading = true;
    this.http.get<Review[]>(`http://localhost:8080/api/reviews/annonce/${this.annonceId}`)
      .subscribe({
        next: (data) => {
          this.reviews = data || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading reviews:', err);
          this.error = 'Failed to load reviews';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  private loadAverageRating(): void {
    this.http.get<number>(`http://localhost:8080/api/reviews/annonce/${this.annonceId}/average`)
      .subscribe({
        next: (rating) => {
          this.averageRating = rating || 0;
        },
        error: (err) => {
          console.error('Error loading average rating:', err);
          this.averageRating = 0;
        }
      });
  }

  submitReview(): void {
    if (!this.authService.isAuthenticated()) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to submit a review',
        icon: 'warning',
        confirmButtonText: 'Go to Login'
      });
      return;
    }

    this.newReview.annonceId = this.annonceId;

    const token = this.authService.getToken();
    if (!token) {
      Swal.fire('Error', 'Authentication token not found', 'error');
      return;
    }

    this.http.post<Review>('http://localhost:8080/api/reviews', this.newReview, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Success!',
          text: 'Your review has been submitted',
          icon: 'success'
        });
        this.reviews.unshift(response);
        this.loadAverageRating();
        this.newReview.stars = 5;
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        Swal.fire({
          title: 'Error',
          text: err.error?.message || 'Failed to submit review',
          icon: 'error'
        });
      }
    });
  }

  deleteReview(reviewId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this review!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = this.authService.getToken();
        if (!token) {
          Swal.fire('Error', 'Authentication token not found', 'error');
          return;
        }

        this.http.delete(`http://localhost:8080/api/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Your review has been deleted.', 'success');
            this.reviews = this.reviews.filter(review => review.id !== reviewId);
            this.loadAverageRating();
          },
          error: (err) => {
            console.error('Error deleting review:', err);
            Swal.fire('Error', 'Failed to delete review', 'error');
          }
        });
      }
    });
  }

  canDeleteReview(review: Review): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.email === review.user.email || currentUser?.role === 'ADMIN';
  }

  getStarsArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStarsArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
