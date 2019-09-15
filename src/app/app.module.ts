import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';

import { JwtAuthInterceptor } from './interceptors/jwt-authentication.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule,
  MatCardModule,
  MatInputModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatGridListModule,
  MatTabsModule

} from '@angular/material';

import { AgmCoreModule } from '@agm/core';

import { SignupComponent } from './authentication/signup/signup.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './authentication/login/login.component';
import { AuctionCreateComponent } from './auctions/auction-create/auction-create.component';
import { AuctionListComponent } from './auctions/auction-list/auction-list.component';
import { UserListComponent } from './administrator/user-list.component';
import { UserInfoComponent } from './administrator/user-info/user-info.component';
import { PendingScreenComponent } from './authentication/pending-screen/pending-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    SignupComponent,
    LoginComponent,
    AuctionCreateComponent,
    AuctionListComponent,
    UserListComponent,
    UserInfoComponent,
    PendingScreenComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule,
    MatGridListModule,
    MatTabsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCyEMjnrac_8UM5_xd0aRy9n74wKxYHB3s',
      libraries: ['places']
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtAuthInterceptor, multi: true},
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
