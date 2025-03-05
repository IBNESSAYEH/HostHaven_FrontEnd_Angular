import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnnonceService } from '../../../services/annonce.service';
import { AuthService } from '../../../services/auth.service';
import { Annonce } from '../../../models/annonce';

@Component({
  selector: 'app-annonce-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './annonce-card.component.html',
  styleUrl: './annonce-card.component.css'
})
export class AnnonceCardComponent {
  @Input() annonce!: Annonce;
  defaultImagePath = 'assets/images/pixlr-image-generator-26626d39-da3b-4fbe-a237-692a13810365.png';

  constructor(
    private route: ActivatedRoute,
    private annonceService: AnnonceService,
    public authService: AuthService
  ) {}

  /**
   * Gets the first image URL from the annonce's images array
   * Returns a default image if no images are available
   */
  getAnnonceImage(): string {
    if (this.annonce && this.annonce.images && this.annonce.images.length > 0) {
      return this.annonce.images[0].imageURL;
    }
    return this.defaultImagePath;
  }
}
