import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookBuddyUser } from '../../interfaces/user.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  public getUserById(userId: string): Observable<BookBuddyUser>{
    return this.http.get<BookBuddyUser>(`${environment.apiUrl}/users/id/${userId}`);
  }
}
