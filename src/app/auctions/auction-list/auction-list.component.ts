import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auctions } from '../auction.model';
import { Subscription } from 'rxjs';
import { Options } from 'ng5-slider';
import { AuctionsService } from '../auctions.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthenticationService } from './../../authentication/authentication.service';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-auction-list',
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css']
})
export class AuctionListComponent implements OnInit, OnDestroy {

  // auctions is used to store all the auctions from the database
  // tempAuctions is used to store only the auctions that the user will see.
  auctions: Auctions[] = [];
  tempAuctions: Auctions[] = [];
  isLoading = false;
  bidValue = null;
  searchValue = '';
  bidErrorMessage = null;

  // Paginator related variables
  totalAuctions = 0;
  auctionsPerPage = 1;
  pageSizeOptions = [1, 2, 4, 6, 10];
  currentPage = 1;

  // Variables used for the price slider
  sliderMinValue = 0;
  sliderMaxValue = 2500;
  sliderOptions: Options = {
    floor: 0,
    ceil: 2500,
    step: 25
  };

  private auctionId = null;
  auction: Auctions = null;
  private mode = 'all';
  private auctionsSub: Subscription;
  constructor(public auctionsService: AuctionsService,
              public route: ActivatedRoute,
              public authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.isLoading = true;

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // If we have an id on the url, we'll show just one auction
      if (paramMap.has('auctionId')) {
        this.mode = 'single';
        this.auctionId = paramMap.get('auctionId');
        this.auctionsService.getSingleAuction(this.auctionId)
        .subscribe(auctionData => {
          console.log(auctionData);
          this.auction = {
            id: auctionData._id,
            name: auctionData.name,
            description: auctionData.description,
            country: auctionData.country,
            category: auctionData.category,
            buyPrice: auctionData.buyPrice,
            startDate: auctionData.startDate,
            endDate: auctionData.endDate,
            latitude: auctionData.latitude,
            longitude: auctionData.longitude,
            image: auctionData.image,
            highestBid: auctionData.highestBid,
            address: auctionData.address,
            sellerId: auctionData.sellerId,
            sellerRating: auctionData.sellerRating
          };
          console.log(this.auction);
          this.isLoading = false;
        });
      } else {
        // If there is not an id in the url we will list all auctions
        // getAuctions() params are from the paginator ( requesting page 1 )
          this.auctionsService.getAuctions(this.auctionsPerPage, this.currentPage);
          this.auctionsSub = this.auctionsService.getAuctionUpdateListener()
          .subscribe((auctionData: {auctions: Auctions[], auctionCount: number}) => {
            this.isLoading = false;
            this.auctions = auctionData.auctions;
            this.totalAuctions = auctionData.auctionCount;
          });
        }
    });
  }

  onDelete(auctionId: string) {
    this.isLoading = true;
    this.auctionsService.deleteAuction(auctionId)
    .subscribe(() => {
      this.auctionsService.getAuctions(this.auctionsPerPage, this.currentPage);
    });
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
  getMode() {
    return (this.mode === 'all');
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
    this.currentPage = pageData.pageIndex + 1;
    this.auctionsPerPage = pageData.pageSize;
    this.auctionsService.getAuctions(this.auctionsPerPage, this.currentPage);
    this.isLoading = false;
  }

  onBidSubmit() {
    if (this.bidValue === null || this.bidValue <= 0) {
      this.bidErrorMessage = 'Please insert a valid amount.';
      return;
    }
    // Check if the current highest bid is higher than the one submitted here.
    if (parseFloat(this.auction.highestBid) > this.bidValue ) {
      this.bidErrorMessage = 'Your bid is lower than the current highest bid.';
      return;
      // Handle error messages to the form
    }
    const userId = this.authenticationService.getLoggedUserId();
    this.bidErrorMessage = null;
    this.auctionsService.submitBid(this.auction.id, userId, this.bidValue);
  }

  checkPrice(auction) {
    if (auction.buyPrice !== null) {
      if (parseFloat(auction.buyPrice) > this.sliderMinValue
          && parseFloat(auction.buyPrice) < this.sliderMaxValue) {
        return true;
      }
    } else {
      return true;
    }
  }

  onSearchSubmit() {
    if (this.searchValue === '') {
      this.tempAuctions = this.auctions.filter(auction => {
        return this.checkPrice(auction);
      });
    } else {
      this.searchValue = this.searchValue.toLowerCase();
      this.tempAuctions = this.auctions.filter(auction => {
        // We have to check different fields.

        // Check if the searchValue is in the name field
        if (auction.name.toLowerCase().includes(this.searchValue)) {
          return this.checkPrice(auction);
        }
        // Check if the searchValue is in the description field
        if (auction.description.toLowerCase().includes(this.searchValue)) {
          return this.checkPrice(auction);
        }
        // Check if the searchValue is in the location field
        if (auction.address.toLowerCase().includes(this.searchValue)) {
          return this.checkPrice(auction);
        }
      });
    }
  }
}
