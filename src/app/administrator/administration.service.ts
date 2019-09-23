import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserModel } from './../authentication/user.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })

export class AdministrationService {

  constructor(private http: HttpClient, private router: Router) {}

  private verifiedUsers: UserModel[] = [];
  private pendingUsers: UserModel[] = [];
  private usersUpdated = new Subject<{verifiedUsers: UserModel[], pendingUsers: UserModel[]}>();

  getUsersUpdatedListener() { return this.usersUpdated; }

  getUsers() {
    this.verifiedUsers = [];
    this.pendingUsers = [];
    // console.log('In getAuctions() !');
    this.http.get<{message: string, users: any}>(
      'http://localhost:3000/admin'
    )
    .subscribe((res) => {
      let i = 0;
      let tempUser: UserModel;
      for ( i = 0; i < res.users.length; i++) {
        tempUser = {
          username: res.users[i].username,
          email: res.users[i].email,
          password: null,
          firstname: null,
          lastname: null,
          afm: null,
          phone: null,
          latitude: null,
          longitude: null,
          address: null
        };
        if (res.users[i].verified) {
          this.verifiedUsers.push(tempUser);
        } else {
          this.pendingUsers.push(tempUser);
        }
      }
      this.usersUpdated.next({verifiedUsers: [...this.verifiedUsers] , pendingUsers: [...this.pendingUsers]});
    });
  }

  getUserInfo(username: string) {
    return this.http.get<{
      message: string,
      user: UserModel
    }>('http://localhost:3000/admin/' + username);
  }

  verifyUser(tusername: string) {
    this.http.post<{message: string}>('http://localhost:3000/admin/', {username: tusername})
      .subscribe(res => {
        this.router.navigate(['/admin']);
      });
  }

  extractAuction(type: string, auctionId: string ) {
    this.http.post<{message: string}>('http://localhost:3000/admin/extract', {type, auctionId})
      .subscribe(res => {
        console.log(res);
      });
  }
}
