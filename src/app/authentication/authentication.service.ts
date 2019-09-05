import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserModel } from './user.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  constructor(private http: HttpClient, private router: Router) {}

  // sends an http put request to the backend to create new user
  sendNewUser(email: string, username: string, password: string) {
    const newUser: UserModel = { username, email, password };
    this.http
      .post('http://localhost:3000/users/signup', newUser)
      .subscribe( () => {
        this.router.navigate(['/']);
      });
  }

  loginUser(username: string, password: string) {
    this.http
      .post('http://localhost:3000/users/login', { username, password})
      .subscribe(res => {

      });
  }

}
