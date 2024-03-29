export interface Auctions {
  id: string;
  name: string;
  description: string;
  country: string;
  buyPrice: string;
  categoriesId: string;
  categoryNames: string[];
  latitude: string;
  longitude: string;
  highestBid: string;
  startDate: string;
  endDate: string;
  image: string;
  address: string;
  sellerId: string;
  sellerRating: string;
  bids: [{
    amount: number,
    time: Date, // This will change to a date data type
    bidderId: string,
    bidderUsername: string,
    bidderRating: number,
    location: string,
    country: string
  }];
 }
