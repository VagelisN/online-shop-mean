import { NgForm } from '@angular/forms';
import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  buttonText = 'Login';
  constructor(public authenticationService: AuthenticationService) {}

  onLogin(form: NgForm) {
    this.buttonText = 'Logging in...';
    this.authenticationService.loginUser(form.value.username, form.value.password);
  }
}
