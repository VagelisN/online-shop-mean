export interface Auctions {
  id: string;
  name: string;
  description: string;
  country: string;
  buyPrice: string;
  category: string;
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
    bidder: string
  }];
 }
