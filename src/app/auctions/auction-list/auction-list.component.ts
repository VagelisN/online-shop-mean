import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auctions } from '../auction.model';
import { Subscription } from 'rxjs';
import { AuctionsService } from '../auctions.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-auction-list',
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css']
})
export class AuctionListComponent implements OnInit, OnDestroy {
  auctions: Auctions[] = [];
  isLoading = false;
  private auctionId = null;
  auction: Auctions = null;
  private mode = 'all';
  private auctionsSub: Subscription;
  constructor(public auctionsService: AuctionsService,
              public route: ActivatedRoute) {}

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
          this.auctionsService.getAuctions();
          this.auctionsSub = this.auctionsService.getAuctionUpdateListener()
          .subscribe((auctions: Auctions[]) => {
            this.isLoading = false;
            this.auctions = auctions;
          });
        }
    });
  }

  onDelete(auctionId: string) {
    this.auctionsService.deleteAuction(auctionId);
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
}
