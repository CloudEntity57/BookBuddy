import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  constructor() { }
  public hubConnection!: signalR.HubConnection;

  public startConnection(): void {

    const token = sessionStorage.getItem('authToken');
    console.log('setting access token in signalR: ', token)
    
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${environment.hubsUrl}/app`,{
      accessTokenFactory: () => token || 'nothing',
      transport: signalR.HttpTransportType.WebSockets,
      withCredentials: true  // this must match backend's AllowCredentials()
    })
    .withAutomaticReconnect()
    .build();
    this.hubConnection
    .start()
    .then(() => console.log('SignalR connection started using access token ', sessionStorage.getItem('authToken')))
    .catch(err => console.log('SignalR connection error: ', err));  

  }
}
