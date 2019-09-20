import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuctionsService } from '../auctions/auctions.service';
import { Categories } from './../auctions/category.model';
import { MessageService } from '../user/messages/message.service';

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
  username = '';
  categories: Categories[] = [];
  numOfUnreadMessages = 0;
  private userAuthenticatedSub: Subscription;
  private unreadCountSub: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authenticationService: AuthenticationService,
    private auctionsService: AuctionsService,
    private messageService: MessageService) {}

  ngOnInit() {
    this.userAuthenticated = this.authenticationService.getUserAuthenticated();
    this.username = this.authenticationService.getUsername();
    this.userAuthenticatedSub = this.authenticationService.getAuthenticationSub().subscribe(newValue => {
      this.userAuthenticated = newValue;
      if (newValue) {
        this.username = this.authenticationService.getUsername();
      }
    });
    this.unreadCountSub = this.messageService.getUnreadCountSub()
    .subscribe(count => {
      this.numOfUnreadMessages = count;
    });
    this.messageService.getUnreadCount(this.username);
  }

  onLogout() {
    this.authenticationService.logoutUser();
  }

  onPickCategory() {
    this.auctionsService.getCategories(null)
      .subscribe( res => {
        this.categories = res.categories;
      });
  }

  onCategoryChosen(id: string) {
  }

  ngOnDestroy() { this.userAuthenticatedSub.unsubscribe(); }
}
