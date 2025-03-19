import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

interface Comment {
  id: string;
  contenu: string;
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
  selector: 'app-property-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './property-comments.component.html',
  styleUrls: ['./property-comments.component.scss']
})
export class PropertyCommentsComponent implements OnInit {
  @Input() annonceId: string = '';

  comments: Comment[] = [];
  isLoading: boolean = false;
  error: string = '';

  newComment: string = '';

  constructor(
    private http: HttpClient,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.annonceId) {
      this.loadComments();
    }
  }

  private loadComments(): void {
    this.isLoading = true;
    this.http.get<Comment[]>(`http://localhost:8080/api/comments/annonce/${this.annonceId}`)
      .subscribe({
        next: (data) => {
          this.comments = data || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading comments:', err);
          this.error = 'Failed to load comments';
          this.isLoading = false;
        }
      });
  }

  submitComment(): void {
    if (!this.newComment.trim()) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to leave a comment',
        icon: 'warning',
        confirmButtonText: 'Go to Login'
      });
      return;
    }

    const commentData = {
      contenu: this.newComment,
      annonceId: this.annonceId
    };

    const token = this.authService.getToken();
    if (!token) {
      Swal.fire('Error', 'Authentication token not found', 'error');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.isLoading = true;
    this.http.post<Comment>('http://localhost:8080/api/comments', commentData, { headers })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.comments.unshift(response);
          this.newComment = '';
          Swal.fire({
            title: 'Success',
            text: 'Your comment has been posted',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error submitting comment:', err);
          Swal.fire({
            title: 'Error',
            text: err.error?.message || 'Failed to submit comment',
            icon: 'error'
          });
        }
      });
  }

  deleteComment(commentId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this comment!',
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

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        this.isLoading = true;
        this.http.delete(`http://localhost:8080/api/comments/${commentId}`, { headers })
          .subscribe({
            next: () => {
              this.isLoading = false;
              this.comments = this.comments.filter(comment => comment.id !== commentId);
              Swal.fire('Deleted!', 'Your comment has been deleted.', 'success');
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Error deleting comment:', err);
              Swal.fire('Error', err.error?.message || 'Failed to delete comment', 'error');
            }
          });
      }
    });
  }

  canDeleteComment(comment: Comment): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.email === comment.user?.email || currentUser?.role === 'ADMIN';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
