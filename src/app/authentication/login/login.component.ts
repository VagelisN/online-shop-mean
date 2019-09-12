import { NgForm } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  buttonText = 'Login';
  errorText = '';
  errorTextSub: Subscription;
  constructor(public authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.errorTextSub = this.authenticationService.getErrorTextSub().subscribe(error => {
      this.errorText = error;
    });
  }

  onLogin(form: NgForm) {
    this.buttonText = 'Logging in...';
    this.authenticationService.loginUser(form.value.username, form.value.password);
    this.buttonText = 'Login';
  }

  ngOnDestroy() {
    this.errorTextSub.unsubscribe();
  }
}
