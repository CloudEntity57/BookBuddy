import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookBuddyCreateRequest, BookBuddyDeleteRequest, BookBuddyUser } from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class BuddyService {

  constructor(private http: HttpClient) { }

  public sendBuddyRequest(activeUserID: string, passiveUserID: string, note: string, bookTitle: string): Observable<boolean> {
    const buddyDTO: BookBuddyCreateRequest = {
      activeUserID,
      passiveUserID,
      note,
      bookTitle,
      dateAdded: new Date().toISOString()
    };
    console.log('buddy DTO: ', buddyDTO)
    return this.http.post(`${environment.apiUrl}/buddy/request`,buddyDTO) as Observable<boolean>;
  }

  public sendCancelBuddyRequest(activeUserID: string, passiveUserID: string): Observable<boolean> {
    const buddyDTO: BookBuddyDeleteRequest = {
      activeUserID,
      passiveUserID
    };
    return this.http.delete(`${environment.apiUrl}/buddy/request`,{body: buddyDTO}) as Observable<boolean>;
  }
}
