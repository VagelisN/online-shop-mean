import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserModel } from './../authentication/user.model';

@Injectable({ providedIn: 'root' })

export class AdministrationService {

  constructor(private http: HttpClient) {}

  private users: UserModel[] = [];
  private usersUpdated = new Subject<UserModel[]>();

  getUsersUpdatedListener() { return this.usersUpdated; }

  getUsers() {
    // console.log('In getAuctions() !');
    this.http.get<{message: string, users: any}>(
      'http://localhost:3000/admin'
    )
    .pipe(map((userData) => {
      return userData.users.map(user => {
        return {
          username: user.name,
          email: user.email
        };
      });
    }))
    .subscribe((transformedUsers) => {
      this.users = transformedUsers;
      this.usersUpdated.next([...this.users]);
    });
  }
}
