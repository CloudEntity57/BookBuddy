import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly apiUrl = environment.apiUrl;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('REQ URL: ', req.url)
    const isApiRequest = req.url.startsWith(this.apiUrl) || req.url.startsWith(environment.hubsUrl);
    console.log(isApiRequest ? `IT IS AN API REQUEST - ${req.url}` : `it aint an api request: ${req.url}`)
    let token: string | null = null;
    let userGuid: string | null = null;

    // Make sure we're in a browser environment
    if (isApiRequest && typeof window !== 'undefined') {
      token = sessionStorage?.getItem('authToken');
      userGuid = sessionStorage?.getItem('user_id');
    }
    const authReq = token
      ? req.clone({ setHeaders: { 
        Authorization: `Bearer ${token}`,
        'X-User-Guid': userGuid || ''    } 
      })
      : req;

      console.log('new req from auth.interceptor.ts: ', authReq);
    return next.handle(authReq);
  }
}