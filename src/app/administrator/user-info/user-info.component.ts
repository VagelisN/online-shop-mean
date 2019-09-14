import { Component, OnInit } from '@angular/core';
import { AdministrationService } from '../administration.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { UserModel } from 'src/app/authentication/user.model';

@Component({
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {

  constructor(public adminService: AdministrationService, public route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('username')) {
        console.log(paramMap.get('username'));
        this.adminService.getUserInfo(paramMap.get('username'))
          .subscribe(user => {

          });
      }
    });
  }
}
