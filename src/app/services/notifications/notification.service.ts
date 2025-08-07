import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateNotificationDTO, Notification } from '../../interfaces/notification.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import * as signalR from '@microsoft/signalR';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  private hubConnection!: signalR.HubConnection;

  public latestNotification = new BehaviorSubject<Notification>({} as Notification);

  // private hubConnection: signalR.HubConnection;

  public startConnection(): void {

    const token = sessionStorage.getItem('id_token');
    console.log('setting access token in signalR: ', token)
    
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`https://localhost:7092/hubs/notifications`,{
      accessTokenFactory: () => token || 'nothing',
      transport: signalR.HttpTransportType.WebSockets,
     withCredentials: true  // this must match backend's AllowCredentials()
    })
      // accessTokenFactory: () => sessionStorage.getItem('access_token') || 'nada'})
    .withAutomaticReconnect()
    .build();
    this.hubConnection
    .start()
    .then(() => console.log('SignalR connection started using access token ', sessionStorage.getItem('id_token')))
    .catch(err => console.log('SignalR connection error: ', err));  
    this.hubConnection.on('NewNotification', (notification: Notification) => {
      console.log('Received notification:', notification);
      this.latestNotification.next(notification);
    });
  }

  public playNotificationSound(): void{
    const audio = new Audio();
    audio.src = 'assets/sounds/new1.mp3';
    audio.load();
    audio.play();
  }

  public addNotification(notification: CreateNotificationDTO): Observable<Notification>{
    return this.http.post(`${environment.apiUrl}/notifications`, notification) as Observable<Notification>;
  }

  public getUserNotifications(userId: string): Observable<Array<Notification>>{
    return this.http.get(`${environment.apiUrl}/notifications/${userId}`) as Observable<Array<Notification>>;
  }
}
