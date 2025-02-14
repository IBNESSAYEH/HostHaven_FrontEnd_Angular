import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserData } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

    apiUrl: string = 'http://localhost:8080/api/users';

    http = inject(HttpClient);

    getAllUsers(): Observable<UserData[]>{
      return this.http.get<UserData[]>(this.apiUrl);
    }

    deleteAccount(id: string): Observable<UserData[]>{
      return this.http.delete<UserData[]>(`${this.apiUrl}/${id}`);
    }

}
