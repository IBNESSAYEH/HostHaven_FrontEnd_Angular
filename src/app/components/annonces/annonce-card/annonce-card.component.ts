import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
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
}
