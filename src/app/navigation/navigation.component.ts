import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuctionsService } from '../auctions/auctions.service';
import { Categories } from './../auctions/category.model';
import { MessageService } from '../user/messages/message.service';
import { Options } from 'ng5-slider';
import { Auctions } from '../auctions/auction.model';

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

  // Variables used for the price slider
  sliderMinValue = 0;
  sliderMaxValue = 2500;
  sliderOptions: Options = {
    floor: 0,
    ceil: 2500,
    step: 25
  };
  showSlider = false;

  searchCategoryChosen = null;
  searchCategoryName = 'Select a category';
  searchValue = '';
  categoryChosen = null;
  categoryChosenName = null;

  userAuthenticated = false;
  username = '';
  categories: Categories[] = [];
  numOfUnreadMessages = 0;
  private userAuthenticatedSub: Subscription;
  private unreadCountSub: Subscription;
  private auctionSearchSub: Subscription;
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

  onCategoryChosen(id: string) {
  }

  onSearchSubmit() {
    // Call searchAuctions() from auction.service.ts
    console.log('onSearchSubmit in auction-list.component');
    console.log(this.categoryChosen);
    let ceiling = this.sliderMaxValue;
    let floor = this.sliderMinValue;
    if (ceiling === this.sliderOptions.ceil) {
      ceiling = null;
    }
    if (floor === this.sliderOptions.floor) {
      floor = null;
    }
    this.auctionsService.searchAuctions(floor, ceiling, this.searchValue,
                                        1, 12, this.searchCategoryChosen);
  }

  onPickCategory() {
    this.auctionsService.getCategories(null)
      .subscribe( res => {
        this.categories = res.categories;
      });
  }

  onPriceRangeClick() {
    this.showSlider = !this.showSlider;
  }

  onSearchCategoryChosen(id: string, name: string) {
    this.searchCategoryChosen = id;
    this.searchCategoryName = name;
  }

  ngOnDestroy() { this.userAuthenticatedSub.unsubscribe(); }
}
