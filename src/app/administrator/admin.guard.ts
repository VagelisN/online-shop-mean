import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './../authentication/authentication.service';

// will be provided to the router module
@Injectable()
export class AdministrationGuard implements CanActivate {

  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  // returns true if the route is accessible
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const authenticated = this.authenticationService.getUserAuthenticated();
    if (authenticated) {
      const username = localStorage.getItem('username');
      if (username !== 'admin') {
        this.router.navigate(['/']);
      }
    } else { this.router.navigate(['/']); }
    return authenticated;
  }
}
