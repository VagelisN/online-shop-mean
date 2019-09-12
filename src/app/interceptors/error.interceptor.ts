import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request)
          .pipe(catchError((err: HttpErrorResponse) => {
            if (err.status === 401 || err.status === 403 || err.status === 500) {
                this.authenticationService.logoutUser();
            }
            const error = err.error.message || err.statusText;
            this.authenticationService.handleError(error);
            return throwError(error);
        }));
    }

}
