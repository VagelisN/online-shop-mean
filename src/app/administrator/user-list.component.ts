import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserModel } from '../authentication/user.model';

import { AdministrationService } from './administration.service';

@Component({
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  verifiedUsers: UserModel[] = [];
  pendingUsers: UserModel [] = [];
  loading = false;

  private adminSub: Subscription;

  constructor(public adminService: AdministrationService) {}

  ngOnInit() {
    this.loading = true;
    this.adminService.getUsers();
    this.adminSub = this.adminService.getUsersUpdatedListener()
      .subscribe( ( {verifiedUsers, pendingUsers} ) => {
        this.loading = false;
        this.verifiedUsers = verifiedUsers;
        this.pendingUsers = pendingUsers;
        console.log(verifiedUsers);
      });
  }

  ngOnDestroy() {
    this.adminSub.unsubscribe();
  }
}
