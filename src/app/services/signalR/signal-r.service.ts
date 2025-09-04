import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalR';


@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  constructor() { }
  public hubConnection!: signalR.HubConnection;

  public startConnection(): void {

    const token = sessionStorage.getItem('id_token');
    console.log('setting access token in signalR: ', token)
    
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`https://localhost:7092/hubs/app`,{
      accessTokenFactory: () => token || 'nothing',
      transport: signalR.HttpTransportType.WebSockets,
      withCredentials: true  // this must match backend's AllowCredentials()
    })
    .withAutomaticReconnect()
    .build();
    this.hubConnection
    .start()
    .then(() => console.log('SignalR connection started using access token ', sessionStorage.getItem('id_token')))
    .catch(err => console.log('SignalR connection error: ', err));  

  }
}
