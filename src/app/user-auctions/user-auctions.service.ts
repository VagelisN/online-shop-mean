import { Injectable } from '@angular/core';
import { Auctions } from '../auctions/auction.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class UserAuctionsService {
  private auctions: Auctions[] = [];
  private userAuctionsUpdated = new Subject<Auctions[]>();

  constructor(private http: HttpClient) {}

  getUserAuctions(userId) {
    this.http.get<{message: string, auctions: any}>(
      'http://localhost:3000/auctions/user/' + userId
    )
    .pipe(
      map(auctionData => {
      return { auctions: auctionData.auctions.map(auction => {
        return {
          name: auction.name,
          description: auction.description,
          country: auction.country,
          category: auction.category,
          buyPrice: auction.buyPrice,
          id: auction._id,
          image: auction.image,
          highestBid: auction.highestBid,
          startDate: auction.startDate,
          endDate: auction.endDate,
          latitude: parseFloat(auction.latitude),
          longitude: parseFloat(auction.longitude),
          address: auction.address,
          sellerRating: auction.sellerRating
        };
      })
    };
  }))
    .subscribe((transformedAuctionData) => {
      this.auctions = transformedAuctionData.auctions;
      this.userAuctionsUpdated.next([...this.auctions]);
    });
  }

  getUserAuctionsUpdateListener() {
    return this.userAuctionsUpdated.asObservable();
  }
}
