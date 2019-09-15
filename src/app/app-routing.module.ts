import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SignupComponent} from './authentication/signup/signup.component';
import { LoginComponent } from './authentication/login/login.component';
import { AuctionCreateComponent } from './auctions/auction-create/auction-create.component';
import { AuctionListComponent } from './auctions/auction-list/auction-list.component';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { UserListComponent } from './administrator/user-list.component';
import { UserInfoComponent } from './administrator/user-info/user-info.component';
import { PendingScreenComponent } from './authentication/pending-screen/pending-screen.component';

const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent},
  { path: 'auction/create', component: AuctionCreateComponent, canActivate: [AuthenticationGuard]},
  { path: 'auction/edit/:auctionId', component: AuctionCreateComponent },
  { path: 'auction', component: AuctionListComponent },
  { path: 'admin', component: UserListComponent},
  { path: 'userinfo/:username', component: UserInfoComponent },
  { path: 'auction/:auctionId', component: AuctionListComponent},
  { path: 'signup/pending', component: PendingScreenComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthenticationGuard]
})
export class AppRoutingModule { }
