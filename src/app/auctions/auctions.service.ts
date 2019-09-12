import { Auctions } from './auction.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class AuctionsService {
  private auctions: Auctions[] = [];
  private auctionsUpdated = new Subject<Auctions[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getAuctions() {
    // console.log('In getAuctions() !');
    this.http.get<{message: string, auctions: any}>(
      'http://localhost:3000/auctions'
    )
    .pipe(map((auctionData) => {
      return auctionData.auctions.map(auction => {
        console.log('In getAuctions, rating: ', auction.sellerRating);
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
      });
    }))
    .subscribe((transformedAuctions) => {
      this.auctions = transformedAuctions;
      this.auctionsUpdated.next([...this.auctions]);
    });
  }

  getAuctionUpdateListener() {
    return this.auctionsUpdated.asObservable();
  }

  getAuction(id: string) {
    return this.http.get<{
      id: string,
      name: string,
      description: string,
      country: string,
      category: string,
      buyPrice: string,
      latitude: string,
      longitude: string,
      highestBid: string,
      startDate: string,
      endDate: string,
      image: string,
      address: string,
      sellerId: string,
      sellerRating: string
    }>('http://localhost:3000/auctions/' + id);
  }

  addAuction(tname: string, tdescription: string, tcountry: string,
             tcategory: string, tbuyPrice: string, tlat: string,
             tlong: string, image: File, tends: string, taddress: string, tsellerId: string) {
    const auctionData = new FormData();
    auctionData.append('name', tname);
    auctionData.append('description', tdescription);
    auctionData.append('country', tcountry);
    auctionData.append('buyPrice', tbuyPrice);
    auctionData.append('category', tcategory);
    auctionData.append('latitude', tlat);
    auctionData.append('longitude', tlong);
    auctionData.append('image', image, tname);
    auctionData.append('endDate', tends);
    auctionData.append('address', taddress);
    auctionData.append('sellerId', tsellerId);

    console.log('------------------------');
    console.log('SellerId in auctionsService: ', auctionData.get('sellerId'));
    console.log('------------------------');

    this.http.post<{ message: string,
                     auctionId: string,
                     imagePath: string,
                     sellerRating: string}>
                     ('http://localhost:3000/auctions/create', auctionData )
     .subscribe( (responseData) => {
        console.log(responseData.message);
        console.log(responseData.auctionId);
        // console.log(responseData.imagePath);
        const auction: Auctions = {
          id: responseData.auctionId,
          name: tname,
          description: tdescription,
          country: tcountry,
          buyPrice: tbuyPrice,
          category: tcategory,
          latitude: tlat,
          longitude: tlong,
          image: responseData.imagePath,
          highestBid: '0',
          endDate: tends,
          address: taddress,
          startDate: '',
          sellerId: tsellerId,
          sellerRating: responseData.sellerRating
        };
        // Once we receive confirmation from server, then update locally
        this.auctions.push(auction);
        this.auctionsUpdated.next([...this.auctions]);
        this.router.navigate(['/auction']);
     });
  }

  updateAuction(tid: string, tname: string, tdescription: string,
                tcountry: string, tcategory: string, tbuyPrice: string,
                tlat: string, tlong: string, timage: string, tends: string, taddress: string, tsellerId: string) {
    const auction: Auctions = {
      id: tid,
      name: tname,
      description: tdescription,
      country: tcountry,
      buyPrice: tbuyPrice,
      category: tcategory,
      endDate: tends,
      latitude: tlat,
      longitude: tlong,
      image: timage,
      highestBid: '0',
      address: taddress,
      startDate: '',
      sellerId: tsellerId,
      sellerRating: ''
    };
    this.http.put('http://localhost:3000/auctions/' + tid, auction)
    .subscribe(response => {
      const updatedAuctions = [...this.auctions];
      const oldAuctionIndex = updatedAuctions.findIndex(p => p.id === auction.id);
      updatedAuctions[oldAuctionIndex] = auction;
      this.auctions = updatedAuctions;
      this.auctionsUpdated.next([...this.auctions]);
      this.router.navigate(['/auction']);
    });
  }

  deleteAuction(auctionId: string) {
    this.http.delete('http://localhost:3000/auctions/' + auctionId)
    .subscribe(() => {
      const updatedAuctions = this.auctions.filter(auction => auction.id !== auctionId);
      this.auctions = updatedAuctions;
      this.auctionsUpdated.next([...this.auctions]);
    });
  }

  startAuction(auctionId: string) {
    this.http.patch<{message: string}>('http://localhost:3000/auctions/start/' + auctionId, '')
    .subscribe((res) => {
      console.log(res.message);
      this.router.navigate(['/auction']);
    });
  }
}
