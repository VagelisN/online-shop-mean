import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserModel } from './user.model';
import { Router } from '@angular/router';
import { Auctions } from './../auctions/auction.model';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  private userAuthenticated = false;
  private userAuthenticatedSub = new Subject<boolean>();
  private errorTextSub = new Subject<string>();

  private userId: string = null;
  private token: string;
  private username: string;
  constructor(private http: HttpClient, private router: Router) {}

  getUserAuthenticated() { return this.userAuthenticated; }

  getAuthenticationSub() { return this.userAuthenticatedSub; }

  getErrorTextSub() { return this.errorTextSub; }

  // sends an http put request to the backend to create new user
  sendNewUser(email: string, username: string, password: string, firstname: string,
              lastname: string, phone: string, afm: string, latitude: string, longitude: string, address: string) {
    const newUser: UserModel = { username, email, password, firstname, lastname, phone, afm, latitude, longitude, address };
    console.log(newUser);
    this.http
      .post('https://localhost:3000/users/signup', newUser)
      .subscribe( () => {
        this.router.navigate(['/signup/pending']);
      });
  }

  getLoggedUserId() {
    return this.userId;
  }

  getUsername() {
    return this.username;
  }

  loginUser(username: string, password: string) {
    this.http
      .post<{token: string, userId: string, username: string}>('https://localhost:3000/users/login', {username, password})
      .subscribe( (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('username', response.username);
        this.userId = response.userId;
        this.userAuthenticated = true;
        this.username = response.username;
        this.userAuthenticatedSub.next(true);
        console.log('|' + this.username + '|');
        console.log('Check if admin result is: ', (this.username === 'admin'));
        if (this.username === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    this.token = null;
    this.userId = null;
    this.username = null;
    this.userAuthenticated = false;
    this.userAuthenticatedSub.next(false);
    this.router.navigate(['/']);
  }

  setUserData() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    this.token = token;
    this.userId = localStorage.getItem('userId');
    this.username = localStorage.getItem('username');
    this.userAuthenticated = true;
  }

  addToVisited(userId: string, auction: Auctions) {
    let textToAdd = '';
    textToAdd += auction.name + ' ' + auction.description + ' ';
    for (let i = 0; i < auction.categoryNames.length; i ++) {
      if ( i < auction.categoryNames.length - 1) {
        textToAdd += auction.categoryNames[i] + ' ';
      } else {
        textToAdd += auction.categoryNames[i] + ' ^e^';
      }
    }
    // console.log(textToAdd);
    this.http.post('https://localhost:3000/users/visited/' + userId, {textToAdd, auctionId: auction.id})
        .subscribe(res => {
          // console.log(res);
        });
  }

  addToBidded(userId: string, auction: Auctions) {
    let textToAdd = '';
    textToAdd += auction.name + ' ' + auction.description + ' ';
    for (let i = 0; i < auction.categoryNames.length; i ++) {
      if ( i < auction.categoryNames.length - 1) {
        textToAdd += auction.categoryNames[i] + ' ';
      } else {
        textToAdd += auction.categoryNames[i] + ' ^e^';
      }
    }
    this.http.post('https://localhost:3000/users/bidded/' + userId, {textToAdd, auctionId: auction.id})
        .subscribe(res => {
          console.log(res);
        });
  }

  handleError(error) {
    this.errorTextSub.next(error);
    if (
      error === 'Wrong Password Entered' ||
      error === 'This Username does not exist' ||
      error === 'User Pending Verification from Admin') {
        this.router.navigate(['/login']);
    } else if (
        error === 'A user with this email adress exists' ||
        error === 'Username taken' ||
        error === 'Invalid Email or Username') {
          this.router.navigate(['/signup']);
    }
  }
}
