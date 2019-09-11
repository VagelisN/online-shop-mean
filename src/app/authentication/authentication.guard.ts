import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

// will be provided to the router module
@Injectable()
export class AuthenticationGuard implements CanActivate {

  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  // returns true if the route is accessible
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const authenticated = this.authenticationService.getUserAuthenticated();
    if (!authenticated) {
      this.router.navigate(['/login']);
    }
    return authenticated;
  }
}
