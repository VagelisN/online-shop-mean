import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserModel } from './user.model';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  private userAuthenticated = false;
  private userAuthenticatedSub = new Subject<boolean>();
  constructor(private http: HttpClient, private router: Router) {}

  getUserAuthenticated() { return this.userAuthenticated; }

  getAuthenticationSub() { return this.userAuthenticatedSub; }

  // sends an http put request to the backend to create new user
  sendNewUser(email: string, username: string, password: string) {
    const newUser: UserModel = { username, email, password };
    console.log(newUser);
    this.http
      .post('https://localhost:3000/users/signup', newUser)
      .subscribe( () => {
        this.router.navigate(['/']);
      });
  }

  loginUser(username: string, password: string) {
    this.http
      .post<{token: string, userId: string}>('https://localhost:3000/users/login', {username, password})
      .subscribe( () => {
        this.userAuthenticated = true;
        this.userAuthenticatedSub.next(true);
        this.router.navigate(['/']);
      });
  }

  logoutUser() {
    this.userAuthenticated = false;
    this.userAuthenticatedSub.next(false);
    this.router.navigate(['/']);
  }

}
