import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {


  constructor(private http: HttpClient) {}

  uploadProfileImage(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.apiUrl}/users/upload-image/${userId}`, formData);
  }

  getProfileImage(userId: string): string {
    if(!userId){
      return `assets/images/default-user-icon.jpg`;
    }
    return `${environment.apiUrl}/users/profile-image/${userId}`;
  }}
