import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auctions } from '../auction.model';
import { Subscription } from 'rxjs';
import { AuctionsService } from '../auctions.service';

@Component({
  selector: 'app-auction-list',
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css']
})
export class AuctionListComponent implements OnInit, OnDestroy {
  auctions: Auctions[] = [];
  isLoading = false;
  private auctionsSub: Subscription;
  constructor(public auctionsService: AuctionsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.auctionsService.getAuctions();
    this.auctionsSub = this.auctionsService.getAuctionUpdateListener()
      .subscribe((auctions: Auctions[]) => {
        this.isLoading = false;
        this.auctions = auctions;
      });
  }

  onDelete(auctionId: string) {
    this.auctionsService.deleteAuction(auctionId);
  }

  onStart(auctionId: string) {
    this.auctionsService.startAuction(auctionId);
  }

  ngOnDestroy() {
    this.auctionsSub.unsubscribe();
  }

  checkBuyPrice(buyPrice: string) {
    const price = parseFloat(buyPrice);
    return (price > 0);
  }
}
