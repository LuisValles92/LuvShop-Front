import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private oktaAuth: OktaAuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {

    // Only add an access token for secured endpoints
    const theEndpoint = environment.url + '/orders';
    const securedEndpoints = [theEndpoint];

    if(securedEndpoints.some(url => request.urlWithParams.includes(url))) {

      /*
       get access token
       await - Wait for the async call to finish
       .getAccesToken() - Async call
      */
      const accessToken = await this.oktaAuth.getAccessToken();

      // clone the request and add new header with acces token - We clone because request is immutable
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }
      });

    }

    return next.handle(request).toPromise();
  }
}
