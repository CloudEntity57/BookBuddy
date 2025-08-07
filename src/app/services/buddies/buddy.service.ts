import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, pipe, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookBuddyCreateRequest, BookBuddyDeleteRequest, BookBuddyUser, CreateBuddyDTO } from '../../interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { BuddyRequestDialogComponent } from '../../shared/components/buddy-request-dialog/buddy-request-dialog.component';
import { ProgressBarService } from '../progress-bar.service';

@Injectable({
  providedIn: 'root'
})
export class BuddyService {

  constructor(private http: HttpClient, private progressBarService: ProgressBarService) { }

  public $buddies = new BehaviorSubject<Array<BookBuddyUser>>([]);

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

  public acceptBuddyRequest(activeUserID: string, passiveUserID: string):Observable<boolean>{
    const buddyDTO: CreateBuddyDTO = {
      userAId: activeUserID,
      userBId: passiveUserID
    }
    return this.http.post(`${environment.apiUrl}/buddy`, buddyDTO) as Observable<boolean>;
  }

  public acceptAndCancelBuddyRequest(activeUserID: string, passiveUserID: string):Observable<Array<BookBuddyUser>>{
    const buddyDTO: CreateBuddyDTO = {
      userAId: activeUserID,
      userBId: passiveUserID
    }
    return this.http.post(`${environment.apiUrl}/buddy`, buddyDTO).pipe(
      switchMap(res => {
        return this.sendCancelBuddyRequest(activeUserID, passiveUserID) as Observable<boolean>;
      }),
      switchMap(res => {
        return this.getBuddies(passiveUserID).pipe(map(res => {
          this.$buddies.next(res);
          return res;
        }))
      })
    );
  }

  public rejectBuddyRequest(activeUserID: string, passiveUserID: string):Observable<boolean>{
    const buddyDTO: BookBuddyDeleteRequest = {
      activeUserID,
      passiveUserID
    };
    return this.http.delete(`${environment.apiUrl}/buddy/request`,{body: buddyDTO}) as Observable<boolean>;
  }

  public getBuddies(userId: string) : Observable<Array<BookBuddyUser>>{
    return this.http.get(`${environment.apiUrl}/buddy/${userId}`) as Observable<Array<BookBuddyUser>>;
  }


}
