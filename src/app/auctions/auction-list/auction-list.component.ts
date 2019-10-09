import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Auctions } from '../auction.model';
import { Subscription } from 'rxjs';
import { Options, LabelType } from 'ng5-slider';
import { AuctionsService } from '../auctions.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthenticationService } from './../../authentication/authentication.service';
import { PageEvent } from '@angular/material';
import { DialogConfirmationComponent } from 'src/app/dialog-confirmation/dialog-confirmation.component';
import { BidDialogComponent } from './../../bid-dialog/bid-dialog.component';
import { AdministrationService } from 'src/app/administrator/administration.service';
import { Categories } from '../category.model';

@Component({
  selector: 'app-auction-list',
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css']
})
export class AuctionListComponent implements OnInit, OnDestroy {

  // auctions is used to store all the auctions from the database
  auctions: Auctions[] = [];
  recommendations: Auctions[] = [];
  isLoading = false;
  bidValue = null;
  searchValue = '';
  bidErrorMessage = null;
  categoryNames = null;
  username = '';

  categoryChosen = null;
  categoryChosenName = null;
  categories: Categories[] = [];

  searchCategoryChosen = null;
  searchCategoryName = 'Select a category';

  priceRange = false;

  // Search variables
  minPrice = null;
  maxPrice = null;
  textSearch = null;
  categoryId = null;

  // Paginator related variables
  totalAuctions = 0;
  auctionsPerPage = 12;
  pageSizeOptions = [ 4, 6, 12, 16, 20];
  currentPage = 1;

  // Variables used for the price slider
  sliderMinValue = 0;
  sliderMaxValue = 2500;
  sliderOptions: Options = {
    floor: 0,
    ceil: 2500,
    step: 25,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return '<b>Min price:</b> $' + value;
        case LabelType.High:
          return '<b>Max price:</b> $' + value;
        default:
          return '$' + value;
      }
    },
    getSelectionBarColor: (value: number): string => {
      if (value >= 0) {
        return '#3F51B5';
      }
    },
    getPointerColor: (value: number): string => {
      if (value >= 0) {
        return 'grey';
      }
    }
  };

  // Slicer variables
  sliceOptions = {
    start: 0,
    end: 400,
    default: 400
  };

  private auctionId = null;
  auction: Auctions = null;
  private mode = 'all';
  private auctionsSub: Subscription;
  private auctionSearchSub: Subscription;
  private recommendationsSub: Subscription;
  constructor(public auctionsService: AuctionsService,
              public route: ActivatedRoute,
              public authenticationService: AuthenticationService,
              public dialog: MatDialog,
              private adminService: AdministrationService) {}

  ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // If we have an id on the url, we'll show just one auction
      if (paramMap.has('auctionId')) {
        this.mode = 'single';
        this.auctionId = paramMap.get('auctionId');
        this.auctionsService.getSingleAuction(this.auctionId)
        .subscribe(auctionData => {
          this.auction = {
            id: auctionData._id,
            name: auctionData.name,
            description: auctionData.description,
            country: auctionData.country,
            categoriesId: auctionData.categoriesId,
            categoryNames: auctionData.categoryNames,
            buyPrice: auctionData.buyPrice,
            startDate: auctionData.startDate,
            endDate: auctionData.endDate,
            latitude: auctionData.latitude,
            longitude: auctionData.longitude,
            image: auctionData.image,
            highestBid: auctionData.highestBid,
            address: auctionData.address,
            sellerId: auctionData.sellerId,
            sellerRating: auctionData.sellerRating,
            bids: auctionData.bids
          };
          this.categoryNames = '';
          for (let index = 0; index < this.auction.categoryNames.length; index++) {
            this.categoryNames += this.auction.categoryNames[index];
            if (index < this.auction.categoryNames.length - 1) {
              this.categoryNames += ' -> ';
            }
          }
          const userId = this.authenticationService.getLoggedUserId();
          this.username = this.authenticationService.getUsername();
          if (userId) {
            this.authenticationService.addToVisited(userId, this.auction);
          }

          this.isLoading = false;
        });
      } else {
        // If there is not an id in the url we will list all auctions
        // getAuctions() params are from the paginator ( requesting page 1 )
          this.auctionsService.getCategories(null)
          .subscribe( res => {
            this.categories = res.categories;
          });
          this.auctionsService.getAuctions(this.auctionsPerPage, this.currentPage);
          this.auctionsSub = this.auctionsService.getAuctionUpdateListener()
          .subscribe((auctionData: {auctions: Auctions[], auctionCount: number}) => {
            this.isLoading = false;
            this.auctions = auctionData.auctions;
            this.totalAuctions = auctionData.auctionCount;
          });
          const userId = this.authenticationService.getLoggedUserId();
          if (userId) {
            this.auctionsService.getRecommendations(userId);
            this.recommendationsSub = this.auctionsService.getRecommendationUpdateListener()
              .subscribe((recom: {recommendations: Auctions[]}) => {
                this.recommendations = recom.recommendations;
              });
          }
        }
    });
  }

  onDelete(auctionId: string) {
    this.isLoading = true;
    this.auctionsService.deleteAuction(auctionId);
    this.auctionsService.getAuctions(this.auctionsPerPage, this.currentPage);
  }

  onStart(auctionId: string) {
    this.auctionsService.startAuction(auctionId);
  }

  ngOnDestroy() {
    if (this.mode === 'all') {
      this.auctionsSub.unsubscribe();
    }
  }

  checkBuyPrice(buyPrice: string) {
      const price = parseFloat(buyPrice);
      return (price > 0);
  }

  // Returns true if mode === all, else false
  getAllMode() {
    return (this.mode === 'all');
  }

  getSearchMode() {
    return (this.mode === 'search');
  }

  getSingleMode() {
    return (this.mode === 'single');
  }

  onPriceRangeClick() {
    this.priceRange = !this.priceRange;
  }

  toNumber(str: string) {
    return parseFloat(str);
  }

  // Check's if the logged in user is the owner of the auction (if sellerId = logged user)
  checkOwnership(sellerId) {
    return (sellerId === this.authenticationService.getLoggedUserId());
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    // Check if we are on SearchMode
    if (this.mode === 'search') {
      this.currentPage = pageData.pageIndex + 1;
      this.auctionsPerPage = pageData.pageSize;
      this.auctionsService.searchAuctions(this.minPrice, this.maxPrice, this.searchValue,
        this.currentPage, this.auctionsPerPage, this.categoryChosen);
    } else {
      this.isLoading = true;
      this.currentPage = pageData.pageIndex + 1;
      this.auctionsPerPage = pageData.pageSize;
      this.auctionsService.getAuctions(this.auctionsPerPage, this.currentPage);
    }
    this.isLoading = false;
  }

  onBidSubmit() {
    if (this.bidValue === null || this.bidValue <= 0) {
      this.bidErrorMessage = 'Please insert a valid amount.';
      return;
    }
    // If the value of the bid is valid then show the pop up for the user to confirm the bid.
    const dialogRef = this.dialog.open( DialogConfirmationComponent );

    // afterClose().subscribe() gets the button that the user pressed on the popup dialog
    dialogRef.afterClosed().subscribe(result => {
      // If result is true then the user confirmed the bid
      if (result === 'true') {
        // Check if the current highest bid is higher than the one submitted here.
        if (parseFloat(this.auction.highestBid) > this.bidValue ) {
          this.bidErrorMessage = 'Your bid is lower than the current highest bid.';
          return;
          // Handle error messages to the form
        }
        const userId = this.authenticationService.getLoggedUserId();
        this.bidErrorMessage = null;
        this.auctionsService.submitBid(this.auction.id, userId, this.bidValue);
      } else {
        this.bidValue = null;
        this.bidErrorMessage = null;
        return;
      }
    });
  }

  onBidList(auction) {
    let tempBids = auction.bids;
    if (tempBids.length > 8) {
      tempBids = tempBids.splice(-8);
    }
    this.dialog.open( BidDialogComponent, {data: {bids: tempBids, name: auction.name}});
  }

  checkPrice(auction) {
    return (auction.buyPrice !== null);
  }

  onSearchSubmit() {
    // Call searchAuctions() from auction.service.ts
    this.isLoading = true;
    this.mode = 'search';
    this.maxPrice = this.sliderMaxValue;
    this.minPrice = this.sliderMinValue;
    if (this.maxPrice === this.sliderOptions.ceil) {
      this.maxPrice = null;
    }
    if (this.minPrice === this.sliderOptions.floor) {
      this.minPrice = null;
    }
    // When we call search, current page is set to 1
    this.currentPage = 1;
    this.auctionsService.searchAuctions(this.minPrice, this.maxPrice, this.searchValue,
                                        this.currentPage, this.auctionsPerPage, this.searchCategoryChosen);
    // Update the categories shown in the left
    this.auctionsService.getCategories(this.searchCategoryChosen)
    .subscribe( res => {
      this.categories = res.categories;
    });
    this.auctionSearchSub = this.auctionsService.getAuctionSearchUpdateListener()
    .subscribe((auctionData: {auctions: Auctions[], auctionCount: number}) => {
      console.log('Gyrise kanonika.');
      this.auctions = auctionData.auctions;
      this.totalAuctions = auctionData.auctionCount;
      this.isLoading = false;
    });
  }

  onExtract(type: string, auctionId: string) {
    this.adminService.extractAuction(type, auctionId);
  }

  onPickCategory() {
    this.auctionsService.getCategories(null)
      .subscribe( res => {
        this.categories = res.categories;
      });
  }

  onCategoryChosen(id: string, name: string) {
    this.isLoading = true;
    this.mode = 'search';
    this.categoryChosen = id;
    this.categoryChosenName = name;
    // If new search query is on then current page = 1
    this.currentPage = 1;
    this.auctionsService.searchAuctions(null, null, '', this.currentPage,
                                        this.auctionsPerPage, this.categoryChosen);
    // Update the categories shown in the left
    this.auctionsService.getCategories(this.categoryChosen)
          .subscribe( res => {
            this.categories = res.categories;
          });
    this.auctionSearchSub = this.auctionsService.getAuctionSearchUpdateListener()
    .subscribe((auctionData: {auctions: Auctions[], auctionCount: number}) => {
      this.auctions = auctionData.auctions;
      this.totalAuctions = auctionData.auctionCount;
      this.isLoading = false;
    });
  }

  onBackToTop() {
    window.scroll(0 , 0);
  }

  onSearchCategoryChosen(id: string, name: string) {
    this.searchCategoryChosen = id;
    this.searchCategoryName = name;
  }

  onExpandText(evt: any): void {
    this.sliceOptions.end = this.sliceOptions.end ? undefined : this.sliceOptions.default;
  }

}
