import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Annonce } from "../../../models/annonce";
import { AnnonceService } from "../../../services/annonce.service";
import { AuthService } from "../../../services/auth.service";
import { FormsModule } from "@angular/forms";

// src/app/features/annonces/annonce-detail/annonce-detail.component.ts
@Component({
  selector: 'app-annonce-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './annonce-detail.component.html',
  styleUrls: ['./annonce-detail.component.scss']
})
export class AnnonceDetailComponent implements OnInit {
  annonce: Annonce | null = null;
  isLoading = true;
  error: string | null = null;
  activeImageIndex = 0;
  contactForm = {
    name: '',
    email: '',
    message: ''
  };

  constructor(
    private route: ActivatedRoute,
    private annonceService: AnnonceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.loadAnnonce(id);
    });
  }

  private loadAnnonce(id: string) {
    this.isLoading = true;
    this.annonceService.getById(id).subscribe({
      next: (data) => {
        this.annonce = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load property details';
        this.isLoading = false;
      }
    });
  }

  onContactSubmit() {
    console.log('Contact form submitted:', this.contactForm);
    // Implement your contact form submission logic here
  }

  onCall() {
    if (this.annonce?.phone) {
      window.location.href = `tel:${this.annonce.phone}`;
    }
  }

  onShare() {
    if (navigator.share) {
      navigator.share({
        title: this.annonce?.title || 'Property Details',
        text: this.annonce?.description || '',
        url: window.location.href
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      console.log('Web Share API not supported');
    }
  }
}
