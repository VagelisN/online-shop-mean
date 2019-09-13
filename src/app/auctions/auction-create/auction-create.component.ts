import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuctionsService } from '../auctions.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Auctions } from '../auction.model';
import { mimeType } from './mime-type.validator';
import { AuthenticationService } from './../../authentication/authentication.service';

@Component ({
  selector: 'app-auction-create',
  templateUrl: './auction-create.component.html',
  styleUrls: ['./auction-create.component.css']
})
export class AuctionCreateComponent implements OnInit {
  private mode = 'create';
  private auctionId: string;
  auction: Auctions;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;

  // Date related variables
  minDate = new Date();
  maxDate = new Date(2019, 12, 10);

  // Map related variables
  private geoCoder;
  address: string;
  latitude = 0;
  longitude = 0;
  zoom: number;
  @ViewChild('search', { static: false })
  public searchElementRef: ElementRef = null;

  constructor(public auctionsService: AuctionsService,
              public route: ActivatedRoute,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone,
              public authenticationService: AuthenticationService) {}

  ngOnInit() {
    // Set up things for map input
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();

      console.log('Searchelement: ', this.searchElementRef);
      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {types: ['address']} );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          // get the place result
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();

          // verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          // set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
    // Finished setting up the map


    this.form = new FormGroup({
      name : new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      description : new FormControl(null, {validators: [Validators.required]}),
      country : new FormControl(null, {validators: [Validators.required]}),
      endDate: new FormControl(null, {validators: [Validators.required]}),
      buyPrice : new FormControl('', {validators: [Validators.min(0),
                                        Validators.max(100000),
                                        Validators.pattern('^[0-9]*$')]}),
      category : new FormControl(null, {validators: [Validators.required]}),
      image : new FormControl(null, {
        validators: [],
        asyncValidators: [mimeType]
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('auctionId')) {
        this.mode = 'edit';
        this.auctionId = paramMap.get('auctionId');
        this.isLoading = true;
        // console.log('I\'m here nigga.');
        // console.log(this.auctionId);
        this.auctionsService.getSingleAuction(this.auctionId).subscribe(auctionData => {
          // console.log('Already subbed.');
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
          this.isLoading = false;
          this.form.setValue({
            name: this.auction.name,
            description: this.auction.description,
            country: this.auction.country,
            buyPrice: this.auction.buyPrice,
            category: this.auction.category,
            image: this.auction.image,
            endDate: this.auction.endDate
          });
        });
      } else {
        this.mode = 'create';
        this.auctionId = null;
      }

    });
  }


  // Map related methods.
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  markerDragEnd($event: MouseEvent) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }
  // End of map related methods

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSaveAuction() {
    console.log('On save auction.');
    if (this.form.invalid) {
      console.log('form is invalid');
      return;
    }
    this.isLoading = true;

    // Get the userId so we can insert it in the seller field.
    const sellerId = this.authenticationService.getLoggedUserId();
    console.log('SellerId: ', sellerId);

    if (this.mode === 'create') {
      // console.log('In onSaveAuction/create method.');
      this.auctionsService.addAuction(this.form.value.name,
                                this.form.value.description,
                                this.form.value.country,
                                this.form.value.category,
                                this.form.value.buyPrice,
                                this.latitude.toString(),
                                this.longitude.toString(),
                                this.form.value.image,
                                this.form.value.endDate,
                                this.address,
                                sellerId);
    } else {
      this.auctionsService.updateAuction(this.auctionId,
                                   this.form.value.name,
                                   this.form.value.description,
                                   this.form.value.country,
                                   this.form.value.category,
                                   this.form.value.buyPrice,
                                   this.latitude.toString(),
                                   this.longitude.toString(),
                                   this.form.value.image,
                                   this.form.value.endDate,
                                   this.address,
                                   sellerId);
    }
    this.form.reset();
  }

}

