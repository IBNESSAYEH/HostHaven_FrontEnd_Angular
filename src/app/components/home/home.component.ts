import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnnonceListComponent } from '../annonces/annonce-list/annonce-list.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ FormsModule, AnnonceListComponent, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
