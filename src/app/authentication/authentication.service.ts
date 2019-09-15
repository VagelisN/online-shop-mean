import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserModel } from './user.model';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  private userAuthenticated = false;
  private userAuthenticatedSub = new Subject<boolean>();
  private errorTextSub = new Subject<string>();

  private userId: string;
  private token: string;
  constructor(private http: HttpClient, private router: Router) {}

  getUserAuthenticated() { return this.userAuthenticated; }

  getAuthenticationSub() { return this.userAuthenticatedSub; }

  getErrorTextSub() { return this.errorTextSub; }

  // sends an http put request to the backend to create new user
  sendNewUser(email: string, username: string, password: string) {
    const newUser: UserModel = { username, email, password };
    console.log(newUser);
    this.http
      .post('http://localhost:3000/users/signup', newUser)
      .subscribe( () => {
        this.router.navigate(['/signup/pending']);
      });
  }

  getLoggedUserId() {
    return this.userId;
  }

  loginUser(username: string, password: string) {
    this.http
      .post<{token: string, userId: string}>('http://localhost:3000/users/login', {username, password})
      .subscribe( (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        this.userAuthenticated = true;
        this.userAuthenticatedSub.next(true);
        this.router.navigate(['/']);
      });
  }

  logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.token = null;
    this.userId = null;
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
    this.userAuthenticated = true;
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
