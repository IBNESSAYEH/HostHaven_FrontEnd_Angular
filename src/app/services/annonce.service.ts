import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Annonce, City, Type, Category } from '../models/annonce';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AnnonceService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token.trim()}`)
        .set('Content-Type', 'application/json')
    };
  }

  create(annonceData: any): Observable<any> {
    if (!annonceData.caracteristiques) {
      annonceData.caracteristiques = {};
    }

    const preparedData = {
      title: annonceData.title,
      description: annonceData.description,
      monthPrice: Number(annonceData.monthPrice),
      weekPrice: annonceData.weekPrice ? Number(annonceData.weekPrice) : null,
      dayPrice: annonceData.dayPrice ? Number(annonceData.dayPrice) : null,
      adress: annonceData.adress,
      phone: annonceData.phone,
      email: annonceData.email,
      cityId: annonceData.cityId,
      typeId: annonceData.typeId,
      categoryId: annonceData.categoryId,
      imageLinks: annonceData.imageLinks || [], // Include image links
      caracteristiques: {
        etage: Number(annonceData.caracteristiques.etage || 0),
        surface: Math.max(1, Number(annonceData.caracteristiques.surface || 1)),
        assenceur: Boolean(annonceData.caracteristiques.assenceur),
        balcon: Boolean(annonceData.caracteristiques.balcon),
        terrasse: Boolean(annonceData.caracteristiques.terrasse),
        piscine: Boolean(annonceData.caracteristiques.piscine),
        jardin: Boolean(annonceData.caracteristiques.jardin),
        parking: Boolean(annonceData.caracteristiques.parking),
        numberRooms: Math.max(1, Number(annonceData.caracteristiques.numberRooms || 1)),
        numberSale: Math.max(0, Number(annonceData.caracteristiques.numberSale || 0)),
        numberSalleBain: Math.max(1, Number(annonceData.caracteristiques.numberSalleBain || 1))
      }
    };

    return this.http.post<any>(`${this.apiUrl}/annonces`, preparedData, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.error('Create annonce error:', error);
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          }
          return throwError(() => error);
        })
      );
  }


  getCities(): Observable<City[]> {
    return this.http.get<City[]>(`${this.apiUrl}/cities`, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.error('Error fetching cities:', error);
          return throwError(() => error);
        })
      );
  }

  getTypes(): Observable<Type[]> {
    return this.http.get<Type[]>(`${this.apiUrl}/types`, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.error('Error fetching types:', error);
          return throwError(() => error);
        })
      );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.error('Error fetching categories:', error);
          return throwError(() => error);
        })
      );
  }

  getAll(): Observable<Annonce[]> {
    return this.http.get<Annonce[]>(`${this.apiUrl}/annonces`);
  }

  getById(id: string): Observable<Annonce> {
    return this.http.get<Annonce>(`${this.apiUrl}/annonces/${id}`);
  }

  update(id: string, annonceData: any): Observable<Annonce> {
    return this.http.put<Annonce>(`${this.apiUrl}/annonces/${id}`, annonceData, this.getAuthHeaders());
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/annonces/${id}`, this.getAuthHeaders());
  }

  getByUserId(userId: string): Observable<Annonce[]> {
    return this.http.get<Annonce[]>(`${this.apiUrl}/annonces/user/${userId}`);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API error:', error);
    return throwError(() => new Error('An error occurred. Please try again later.'));
  }

  changeStatus(id: string): Observable<Annonce> {
    return this.http.put<Annonce>(`${this.apiUrl}/annonces/${id}/change-status`, {}).pipe(
      catchError(this.handleError)
    );
  }
}
