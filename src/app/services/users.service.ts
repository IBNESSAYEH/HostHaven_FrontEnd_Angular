import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AdminUser, User, UserData } from '../models/user';
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

    deleteAccount(id: string): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    updateProfile(userId: string, userData: {
      firstName: string;
      lastName: string;
      phone: string;
    }): Observable<UserData> {
      const requestData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: this.authService.getCurrentUser()?.role
      };

      return this.http.put<UserData>(`${this.apiUrl}/${userId}`, requestData);
    }

    changePassword(userId: string, passwordData: {
      currentPassword: string;
      newPassword: string;
    }): Observable<any> {
      return this.http.put(`${this.apiUrl}/${userId}/change-password`, passwordData);
    }

    getAllUsers(): Observable<AdminUser[]> {
      return this.http.get<UserData[]>(this.apiUrl).pipe(
        map(users => users.map(user => this.mapToAdminUserInterface(user)))
      );
    }

    getUserById(id: string): Observable<AdminUser> {
      return this.http.get<UserData>(`${this.apiUrl}/${id}`).pipe(
        map(user => this.mapToAdminUserInterface(user))
      );
    }

    updateUser(id: string, userData: any): Observable<AdminUser> {
      return this.http.put<UserData>(`${this.apiUrl}/${id}`, userData).pipe(
        map(user => this.mapToAdminUserInterface(user))
      );
    }

    updateUserRole(userId: string, role: string): Observable<AdminUser> {
      const roleRequest = {
        role: role
      };

      return this.http.put<UserData>(`${this.apiUrl}/${userId}/role`, roleRequest).pipe(
        map(user => this.mapToAdminUserInterface(user))
      );
    }

    deleteUser(id: string): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    private mapToAdminUserInterface(user: UserData): AdminUser {
      return {
        id: user.id.toString(),
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'GUEST',
        emailVerificationStatus: user.emailVerificationStatus || false,
        inscriptionDate: user.inscriptionDate || new Date().toISOString()
      };
    }


    verifyUserEmail(userId: string): Observable<AdminUser> {
      return this.http.put<UserData>(`${this.apiUrl}/${userId}/verification-email`, {}).pipe(
        map(user => this.mapToAdminUserInterface(user))
      );
    }

    unverifyUserEmail(userId: string): Observable<AdminUser> {
      return this.http.put<UserData>(`${this.apiUrl}/${userId}/unverification-email`, {}).pipe(
        map(user => this.mapToAdminUserInterface(user))
      );
    }

  }
