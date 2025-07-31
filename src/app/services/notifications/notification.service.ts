import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateNotificationDTO, Notification } from '../../interfaces/notification.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  public addNotification(notification: CreateNotificationDTO): Observable<Notification>{
    return this.http.post(`${environment.apiUrl}/notifications`, notification) as Observable<Notification>;
  }

  public getUserNotifications(userId: string): Observable<Array<Notification>>{
    return this.http.get(`${environment.apiUrl}/notifications/${userId}`) as Observable<Array<Notification>>;
  }
}
