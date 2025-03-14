import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Annonce } from "../../../models/annonce";
import { AnnonceService } from "../../../services/annonce.service";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

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
  defaultImagePath = 'assets/images/pixlr-image-generator-1ebfe583-0068-4415-9b35-5330d6ac9f10.png';

  contactForm: ContactForm = {
    name: '',
    email: '',
    message: ''
  };

  constructor(
    private route: ActivatedRoute,
    private annonceService: AnnonceService
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

  setActiveImage(index: number) {
    this.activeImageIndex = index;
  }

  getMainImage(): string {
    if (this.annonce && this.annonce.images && this.annonce.images.length > 0) {
      return this.annonce.images[this.activeImageIndex].imageURL;
    }
    return this.defaultImagePath;
  }

  onContactSubmit() {
    console.log('Contact form submitted:', this.contactForm);
    this.contactForm = {
      name: '',
      email: '',
      message: ''
    };

    alert('Your message has been sent to the property owner!');
  }

  onShare() {
    if (navigator.share) {
      navigator.share({
        title: this.annonce?.title || 'Property Listing',
        text: `Check out this property: ${this.annonce?.title}`,
        url: window.location.href
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  }
}
