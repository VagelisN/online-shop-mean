import { NgForm } from '@angular/forms';
import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(public authenticationService: AuthenticationService) {}

  onLogin(form: NgForm) {
    this.authenticationService.loginUser(form.value.username, form.value.password);
  }
}
