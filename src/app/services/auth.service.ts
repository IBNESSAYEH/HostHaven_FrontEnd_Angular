import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
    private tokenKey = 'token';
  userSubject = new BehaviorSubject<any>(null);
   public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredToken();
  }

  private loadStoredToken() {
      const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        const decodedToken = this.decodeToken(token);
        if (decodedToken) {
          this.userSubject.next(decodedToken);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        this.logout();
      }
    }
  }

  getCurrentUser():  any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken = this.decodeToken(token);
      return {
        firstName: decodedToken.firstName || '',
         lastName: decodedToken.lastNAme || '',
        email: decodedToken.email || '',
          phone: decodedToken.phone || '',
        role: decodedToken.role || '',
        userId: decodedToken.userId || ''
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            const decodedToken = this.decodeToken(response.token);
            this.userSubject.next(decodedToken);
          }
        })
      );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/authenticate`, credentials)
      .pipe(
        tap(response => {
          if (response && response.token) {
              localStorage.setItem(this.tokenKey, response.token);
            const decodedToken = this.decodeToken(response.token);
            this.userSubject.next(decodedToken);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token ? token.trim() : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decodedToken = this.decodeToken(token.trim());
      if (!decodedToken) return false;

      const expirationDate = new Date(decodedToken.exp * 1000);
      return expirationDate > new Date();
    } catch {
      return false;
    }
  }

  private decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getCurrentUserEmail(): string | null {
    const decodedToken = this.userSubject.getValue();
    return decodedToken?.email || null;
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken = this.decodeToken(token.trim());
      if (!decodedToken) return null;

      return decodedToken.userId || null;
    } catch (error) {
      console.error('Error getting user ID from token:', error);
      return null;
    }
  }
}
