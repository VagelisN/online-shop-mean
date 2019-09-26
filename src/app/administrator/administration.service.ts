import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UserModel } from './../authentication/user.model';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';

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
      'https://localhost:3000/admin'
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
    }>('https://localhost:3000/admin/' + username);
  }

  verifyUser(tusername: string) {
    this.http.post<{message: string}>('https://localhost:3000/admin/', {username: tusername})
      .subscribe(res => {
        this.router.navigate(['/admin']);
      });
  }


  extractAuction(type: string, auctionId: string ) {
    this.http.post<{message: string, extractedAuction: string}>('https://localhost:3000/admin/extract', {type, auctionId})
      .subscribe(res => {
        console.log(res);
        const blob = new Blob([res.extractedAuction], { type: 'text/plain' });
        if ( type === 'XML') {
          saveAs(blob, auctionId + '.xml');
        } else {
          saveAs(blob,  auctionId + '.json');
        }
      });
  }

  extractAllAuctions(username: string, type: string) {
    this.http.post<{message: string, extractedAuctions: string}>('https://localhost:3000/admin/extract-all', {type, username})
      .subscribe(res => {
        console.log(res);
        const blob = new Blob([res.extractedAuctions], { type: 'text/plain' });
        if ( type === 'XML') {
          saveAs(blob, username + '_auctions.xml');
        } else {
          saveAs(blob, username + '_auctions.json');
        }
      });
  }
}
