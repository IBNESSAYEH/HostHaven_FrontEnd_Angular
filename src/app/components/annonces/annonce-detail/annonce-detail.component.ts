import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Annonce } from "../../../models/annonce";
import { AnnonceService } from "../../../services/annonce.service";

// src/app/features/annonces/annonce-detail/annonce-detail.component.ts
@Component({
  selector: 'app-annonce-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './annonce-detail.component.html',
  styleUrls: ['./annonce-detail.component.scss']
})
export class AnnonceDetailComponent implements OnInit {
  annonce: Annonce | null = null;
  isLoading = true;
  error: string | null = null;
  activeImageIndex = 0;

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
}
