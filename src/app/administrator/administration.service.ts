import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserModel } from './../authentication/user.model';

@Injectable({ providedIn: 'root' })

export class AdministrationService {

  constructor(private http: HttpClient) {}

  private verifiedUsers: UserModel[] = [];
  private pendingUsers: UserModel[] = [];
  private usersUpdated = new Subject<{verifiedUsers: UserModel[], pendingUsers: UserModel[]}>();

  getUsersUpdatedListener() { return this.usersUpdated; }

  getUsers() {
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
          password: null
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

  verifyUser() {

  }
}
