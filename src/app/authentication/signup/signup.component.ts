import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Subscription } from 'rxjs';
import { MapsAPILoader, MouseEvent } from '@agm/core';

import { MustMatchDirective } from './must-match.directive';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  buttonText = 'Signup';
  errorText = '';
  errorTextSub: Subscription;
  model: any = {};

  // Map related variables
  private geoCoder;
  address: string;
  latitude = 0;
  longitude = 0;
  zoom: number;

  constructor(private authenticationService: AuthenticationService,
              private mapsAPILoader: MapsAPILoader) {}

  ngOnInit() {
    // Load the map.
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();
      this.setCurrentLocation();
    });


    this.errorTextSub = this.authenticationService.getErrorTextSub().subscribe(error => {
      this.buttonText = 'Signup';
      document.querySelector('mat-sidenav-content').scrollTop = 0;
      this.errorText = error;
    });

  }

  onSignup(form: NgForm) {
    this.buttonText = 'Signing up...';
    this.authenticationService.sendNewUser(form.value.email,
                                           form.value.username,
                                           form.value.password,
                                           form.value.firsname,
                                           form.value.lastname,
                                           form.value.phone,
                                           form.value.afm,
                                           this.latitude.toString(),
                                           this.longitude.toString(),
                                           this.address);
  }

  ngOnDestroy() {
    this.errorTextSub.unsubscribe();
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
}
