import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  userAuthenticated = false;
  private userAuthenticatedSub: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.userAuthenticated = this.authenticationService.getUserAuthenticated();
    this.userAuthenticatedSub = this.authenticationService.getAuthenticationSub().subscribe(newValue => {
      this.userAuthenticated = newValue;
    });
  }

  onLogout() {
    this.authenticationService.logoutUser();
  }

  ngOnDestroy() { this.userAuthenticatedSub.unsubscribe(); }
}
