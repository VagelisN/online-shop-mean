import { Auctions } from './auction.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class AuctionsService {
  private auctions: Auctions[] = [];
  private auctionsUpdated = new Subject<{auctions: Auctions[], auctionCount: number}>();
  private auctionSearchUpdated = new Subject<{auctions: Auctions[], auctionCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getAuctions(pageSize, currentPage) {
    const queryParams = `?pageSize=${pageSize}&currentPage=${currentPage}`;
    // console.log('in getAuctions() pagesize and currentpage: ', pageSize, currentPage);
    this.http.get<{message: string, auctions: any, maxAuctions: number}>(
      'http://localhost:3000/auctions' + queryParams
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
      , maxAuctions: auctionData.maxAuctions
      };
    }))
    .subscribe((transformedAuctionData) => {
      this.auctions = transformedAuctionData.auctions;
      this.auctionsUpdated.next({ auctions: [...this.auctions],
                                  auctionCount: transformedAuctionData.maxAuctions});
    });
  }



  getAuctionUpdateListener() {
    return this.auctionsUpdated.asObservable();
  }

  getAuctionSearchUpdateListener() {
    return this.auctionSearchUpdated.asObservable();
  }

  getSingleAuction(id: string) {
    console.log('In getSingleAuction in auctions.service.ts');
    return this.http.get<{
      _id: string,
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
      sellerRating: string,
      bids: [{
        amount: number,
        time: Date, // This will change to a date data type
        bidder: string
      }]
    }>('http://localhost:3000/auctions/get/' + id);
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
      sellerRating: '',
      bids: null
    };
    this.http.put('http://localhost:3000/auctions/' + tid, auction)
    .subscribe(response => {
      this.router.navigate(['/auction']);
    });
  }

  deleteAuction(auctionId: string) {
    return this.http.delete('http://localhost:3000/auctions/' + auctionId);
  }

  startAuction(auctionId: string) {
    this.http.patch<{message: string}>('http://localhost:3000/auctions/start/' + auctionId, '')
    .subscribe((res) => {
      console.log(res.message);
      this.router.navigate(['/auction']);
    });
  }

  submitBid(auctionId: string, userId: string , tbid: number) {
    const bid = {
      id: userId,
      bid: tbid
    };
    this.http.patch<{message: string}>('http://localhost:3000/auctions/bid/' + auctionId, bid)
    .subscribe((res) => {
      console.log(res.message);
      this.router.navigate(['/auction/' + auctionId]);
    });
  }


  searchAuctions(tminPrice: number, tmaxPrice: number, tsearchValue: string, currentPage: number, pageSize: number) {
    console.log('In searchAuctions in auctions.service.ts');
    const searchParams =
      `?minPrice=${tminPrice}&maxPrice=${tmaxPrice}&searchValue=${tsearchValue}&currentPage=${currentPage}&pageSize=${pageSize}`;
    this.http.get<{message: string, auctions: any, auctionCount: number}>
      ('http://localhost:3000/auctions/search' + searchParams)
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
          , auctionCount: auctionData.auctionCount
        };
      }))
      .subscribe((transformedAuctionData) => {
        this.auctions = transformedAuctionData.auctions;
        this.auctionsUpdated.next({ auctions: [...this.auctions],
                                    auctionCount: transformedAuctionData.auctionCount});
      });
  }

  getCategories(parentId: string) {
    return this.http.get<{message: string, categories: any}>(
      'http://localhost:3000/auctions/categories/' + parentId
    );
  }

  findPath(id: string) {
    return this.http.get<{message: string, path: string[]}>(
      'http://localhost:3000/auctions/categories/path/' + id
    );
  }
}




