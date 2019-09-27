import { Component, OnInit } from '@angular/core';
import { Auctions } from './../auctions/auction.model';
import { AuthenticationService } from './../authentication/authentication.service';
import { Subscription } from 'rxjs';
import { AuctionsService } from '../auctions/auctions.service';

@Component({
  selector: 'app-user-auctions',
  templateUrl: './user-auctions.component.html',
  styleUrls: ['./user-auctions.component.css']
})
export class UserAuctionsComponent implements OnInit {
  mode = 'active';
  isLoading = false;
  auctions: Auctions[] = [];
  userId = this.authenticationService.getLoggedUserId();
  private auctionsSub: Subscription;
  constructor(public auctionsService: AuctionsService,
              public authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.isLoading = true;
    this.mode = 'active';
    this.auctionsService.getUserActiveAuctions(this.userId);
    this.auctionsSub = this.auctionsService.getUserAuctionsUpdateListener()
      .subscribe((fetchedAuctions: Auctions[]) => {
        this.auctions = fetchedAuctions;
        this.isLoading = false;
      });
  }

  checkBuyPrice(buyPrice) {
    return (buyPrice !== null);
  }

  onDelete(auctionId: string) {
    this.isLoading = true;
    this.auctionsService.deleteAuction(auctionId);
    this.mode = 'active';
    this.auctionsService.getUserActiveAuctions(this.userId);
  }

  onStart(auctionId: string) {
    this.auctionsService.startAuction(auctionId);
  }

  toNumber(str: string) {
    return parseFloat(str);
  }

  onFinishedAuctions() {
    this.isLoading = true;
    this.mode = 'finished';
    this.auctionsService.getUserFinishedAuctions(this.userId);
    this.auctionsSub = this.auctionsService.getUserAuctionsUpdateListener()
      .subscribe((fetchedAuctions: Auctions[]) => {
        this.auctions = fetchedAuctions;
        this.isLoading = false;
      });
  }

  onActiveAuctions() {
    this.isLoading = true;
    this.mode = 'active';
    this.auctionsService.getUserActiveAuctions(this.userId);
    this.auctionsSub = this.auctionsService.getUserAuctionsUpdateListener()
      .subscribe((fetchedAuctions: Auctions[]) => {
        this.auctions = fetchedAuctions;
        this.isLoading = false;
      });
  }

}
