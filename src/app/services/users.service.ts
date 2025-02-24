import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserData } from '../models/user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

    apiUrl: string = 'http://localhost:8080/api/users';

    http = inject(HttpClient);

    constructor(
      private authService: AuthService
    ) {}

    getAllUsers(): Observable<UserData[]>{
      return this.http.get<UserData[]>(this.apiUrl);
    }

    deleteAccount(id: string): Observable<UserData[]>{
      return this.http.delete<UserData[]>(`${this.apiUrl}/${id}`);
    }

    updateProfile(userId: string, userData: {
      firstName: string;
      lastName: string;
      phone: string;
    }): Observable<any> {
      const requestData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: this.authService.getCurrentUser()?.role
      };

      return this.http.put(`${this.apiUrl}/${userId}`, requestData);
    }

    changePassword(userId: string, passwordData: {
      currentPassword: string;
      newPassword: string;
    }): Observable<any> {
      return this.http.put(`${this.apiUrl}/${userId}/change-password`, passwordData);
    }

}
