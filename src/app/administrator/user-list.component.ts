import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserModel } from '../authentication/user.model';

import { AdministrationService } from './administration.service';

@Component({
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: UserModel[] = [];
  loading = false;

  private adminSub: Subscription;

  constructor(public adminService: AdministrationService) {}

  ngOnInit() {
    console.log("pppppppppppppppppppp");
    this.loading = true;
    this.adminService.getUsers();
    this.adminSub = this.adminService.getUsersUpdatedListener()
      .subscribe((users: UserModel[]) => {
        this.loading = false;
        this.users = users;
      });
  }


  ngOnDestroy() {
    this.adminSub.unsubscribe();
  }
}
