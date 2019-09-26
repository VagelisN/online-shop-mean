import { Auctions } from './auction.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router, NavigationExtras } from '@angular/router';

@Injectable({providedIn: 'root'})
export class AuctionsService {
  private auctions: Auctions[] = [];
  private searchCount: number = null;
  private recommendations: Auctions[] = [];
  private auctionsUpdated = new Subject<{auctions: Auctions[], auctionCount: number}>();
  private recommendationsUpdated = new Subject<{recommendations: Auctions[]}>();
  private pathSub = new Subject<[{id: string, name: string}]>();
  private auctionSearchUpdated = new Subject<{auctions: Auctions[], auctionCount: number}>();
  private userAuctionsUpdated = new Subject<Auctions[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getAuctions(pageSize, currentPage) {
    const queryParams = `?pageSize=${pageSize}&currentPage=${currentPage}`;
    // console.log('in getAuctions() pagesize and currentpage: ', pageSize, currentPage);
    this.http.get<{message: string, auctions: any, maxAuctions: number}>(
      'https://localhost:3000/auctions' + queryParams
    )
    .pipe(
      map(auctionData => {
      return { auctions: auctionData.auctions.map(auction => {
        return {
          name: auction.name,
          description: auction.description,
          country: auction.country,
          categoriesId: auction.categoriesId,
          categoryNames: auction.catNameArray,
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

  getRecommendations(userId: string) {
    this.http.get<{message: string, recommendations: any}>(
      'https://localhost:3000/auctions/rec/' + userId
    )
    .pipe(
      map(recommendationData => {
        if (!recommendationData.recommendations) {
          return;
        }
        return { recommendations: recommendationData.recommendations.map(recom => {
          return {
            name: recom.name,
            description: recom.description,
            country: recom.country,
            categoriesId: recom.categoriesId,
            categoryNames: recom.catNameArray,
            buyPrice: recom.buyPrice,
            id: recom._id,
            image: recom.image,
            highestBid: recom.highestBid,
            startDate: recom.startDate,
            endDate: recom.endDate,
            latitude: parseFloat(recom.latitude),
            longitude: parseFloat(recom.longitude),
            address: recom.address,
            sellerRating: recom.sellerRating
          };
        })};
    }))
    .subscribe((transformedRecommendationData) => {
      if (transformedRecommendationData) {
        this.recommendations = transformedRecommendationData.recommendations;
        this.recommendationsUpdated.next({ recommendations: [...this.recommendations] });
      }
    });
  }

  getPathUpdateListener() {
    return this.pathSub.asObservable();
  }

  getAuctionUpdateListener() {
    return this.auctionsUpdated.asObservable();
  }

  getRecommendationUpdateListener() {
    return this.recommendationsUpdated.asObservable();
  }

  getAuctionSearchUpdateListener() {
    return this.auctionSearchUpdated.asObservable();
  }

  getSearchAuctions() {
    return [...this.auctions];
  }

  getSearchAuctionsCount() {
    return this.searchCount;
  }

  getSingleAuction(id: string) {
    console.log('In getSingleAuction in auctions.service.ts');
    return this.http.get<{
      _id: string,
      name: string,
      description: string,
      country: string,
      categoriesId: string,
      categoryNames: string[],
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
        bidderId: string,
        bidderUsername: string,
        bidderRating: number,
        location: string,
        country: string
      }]
    }>('https://localhost:3000/auctions/get/' + id);
  }

  addAuction(tname: string, tdescription: string, tcountry: string,
             tcategoriesId: string, tcatNameArray: string, tbuyPrice: string, tlat: string,
             tlong: string, image: File, tends: string, taddress: string, tsellerId: string) {
    const auctionData =   new FormData();
    auctionData.append('name', tname);
    auctionData.append('description', tdescription);
    auctionData.append('country', tcountry);
    auctionData.append('buyPrice', tbuyPrice);
    auctionData.append('categoriesId', tcategoriesId);
    auctionData.append('categoryNames', tcatNameArray);
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
                     ('https://localhost:3000/auctions/create', auctionData )
     .subscribe( (responseData) => {
        this.router.navigate(['/']);
     });
  }

  updateAuction(tid: string, tname: string, tdescription: string,
                tcountry: string, tcategoriesId: string, tcatNameArray: string, tbuyPrice: string,
                tlat: string, tlong: string, timage: string, tends: string, taddress: string, tsellerId: string) {
    const auction: Auctions = {
      id: tid,
      name: tname,
      description: tdescription,
      country: tcountry,
      buyPrice: tbuyPrice,
      categoriesId: tcategoriesId,
      categoryNames: [tcatNameArray],
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
    this.http.put('https://localhost:3000/auctions/' + tid, auction)
    .subscribe(response => {
      this.router.navigate(['/']);
    });
  }

  deleteAuction(auctionId: string) {
    this.http.delete('https://localhost:3000/auctions/' + auctionId).subscribe( res => {
      this.router.navigate(['/']);
    });
  }

  startAuction(auctionId: string) {
    this.http.patch<{message: string}>('https://localhost:3000/auctions/start/' + auctionId, '')
    .subscribe((res) => {
      console.log(res.message);
      this.router.navigate(['/auction/' + auctionId])
      .then(() => {
        window.location.reload();
      });
    });
  }

  submitBid(auctionId: string, userId: string , tbid: number) {
    const bid = {
      id: userId,
      bid: tbid
    };
    this.http.patch<{message: string}>('https://localhost:3000/auctions/bid/' + auctionId, bid)
    .subscribe((res) => {
      console.log(res.message);
      this.router.navigate(['/']);
    });
  }


  searchAuctions(tminPrice: number, tmaxPrice: number, tsearchValue: string, currentPage: number, pageSize: number, catId: string) {
    const searchParams =
    // tslint:disable-next-line: max-line-length
    `?minPrice=${tminPrice}&maxPrice=${tmaxPrice}&searchValue=${tsearchValue}&currentPage=${currentPage}&pageSize=${pageSize}&catId=${catId}`;
    console.log(tminPrice, tmaxPrice, tsearchValue, currentPage, pageSize, catId);
    console.log('Sending the request to the backend');
    this.http.get<{message: string, auctions: any, auctionCount: number}>
      ('https://localhost:3000/auctions/search' + searchParams)
      .pipe(
        map(auctionData => {
          return { auctions: auctionData.auctions.map(auction => {
            return {
              name: auction.name,
              description: auction.description,
              country: auction.country,
              categoriesId: auction.categoriesId,
              categoryNames: auction.categoryNames,
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
          }),
          auctionCount: auctionData.auctionCount
        };
      }))
      .subscribe((transformedAuctionData) => {
        console.log('About to update this.auctions. ', this.auctions.length);
        this.auctions = transformedAuctionData.auctions;
        console.log('Updated: ', this.auctions.length);
        this.searchCount = transformedAuctionData.auctionCount;
        this.auctionSearchUpdated.next({ auctions: [...this.auctions],
                                    auctionCount: transformedAuctionData.auctionCount});
        const queryParams = { searchValue : tsearchValue,
                                      minPrice: tminPrice,
                                      maxPrice: tmaxPrice,
                                      catId,
                                      currentPage,
                                      pageSize };
        this.router.navigate(['/'], { queryParams });
      });
  }

  getCategories(parentId: string) {
    return this.http.get<{message: string, categories: any}>(
      'https://localhost:3000/auctions/categories/' + parentId
    );
  }

  findPath(id: string) {
    this.http.get<{message: string, path: [{id: string, name: string}]}>(
      'https://localhost:3000/auctions/categories/path/' + id
    ).subscribe( res => {
      const path = res.path;
      this.pathSub.next(path);
    });
  }

  // These functions are used for the path /user/auctions so a user can manage his auctions.
  getUserAuctions(userId) {
    this.http.get<{message: string, auctions: any}>(
      'https://localhost:3000/auctions/user/' + userId
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
          sellerRating: auction.sellerRating,
          bids: auction.bids,
          sellerId: auction.sellerId
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

  rateUser(trating, ttype, userId) {
    this.http.patch<{message: string}>('https://localhost:3000/auctions/rate/' + userId,
     {rating: trating,
      type: ttype})
    .subscribe((res) => {
      this.router.navigate(['/user/auctions']);
    });
  }
}




