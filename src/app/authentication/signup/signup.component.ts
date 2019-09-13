import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  buttonText = 'Signup';
  errorText = '';
  errorTextSub: Subscription;
  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.errorTextSub = this.authenticationService.getErrorTextSub().subscribe(error => {
      this.errorText = error;
    });
  }

  onSignup(form: NgForm) {
    this.buttonText = 'Signing up...';
    this.authenticationService.sendNewUser(form.value.email, form.value.username, form.value.password);
    this.buttonText = 'Signup';
  }

  ngOnDestroy() {
    this.errorTextSub.unsubscribe();
  }
}
