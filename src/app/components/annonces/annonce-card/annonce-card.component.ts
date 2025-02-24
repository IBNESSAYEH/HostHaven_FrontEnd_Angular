
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


  constructor(

    private route: ActivatedRoute,
    private annonceService: AnnonceService,
    public authService: AuthService
  ) {
   

  }
}
