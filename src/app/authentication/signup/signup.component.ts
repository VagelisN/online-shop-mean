import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  constructor(private authenticationService: AuthenticationService) {}

  onSignup(form: NgForm) {
    this.authenticationService.sendNewUser(form.value.email, form.value.password, form.value.email);
  }
}
