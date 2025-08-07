import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookBuddyCreateRequest, BookBuddyDeleteRequest, BookBuddyUser, CreateBuddyDTO } from '../../interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { BuddyRequestDialogComponent } from '../../shared/components/buddy-request-dialog/buddy-request-dialog.component';
import { ProgressBarService } from '../progress-bar.service';

@Injectable({
  providedIn: 'root'
})
export class BuddyService {
  readonly dialog = inject(MatDialog);


  constructor(private http: HttpClient, private progressBarService: ProgressBarService) { }

  public dialogTest(){
        const dialogRef = this.dialog.open(BuddyRequestDialogComponent, {
          data: {
            name: "Josh",
            requestNote: "Sup"
          }
        });
  }

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
