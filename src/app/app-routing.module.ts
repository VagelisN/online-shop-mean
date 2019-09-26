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
import { AdministrationGuard } from './administrator/admin.guard';
import { MessagesComponent } from './user/messages/messages.component';
import { UserAuctionsComponent } from './user-auctions/user-auctions.component';
import { SearchListComponent } from './search-list/search-list.component';

const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent},
  { path: 'auction/create', component: AuctionCreateComponent, canActivate: [AuthenticationGuard]},
  { path: 'auction/edit/:auctionId', component: AuctionCreateComponent },
  { path: '', component: AuctionListComponent },
  { path: 'admin', component: UserListComponent, canActivate: [AdministrationGuard]},
  { path: 'userinfo/:username', component: UserInfoComponent, canActivate: [AdministrationGuard] },
  { path: 'auction/:auctionId', component: AuctionListComponent},
  { path: 'signup/pending', component: PendingScreenComponent},
  { path: 'user/messages', component: MessagesComponent, canActivate: [AuthenticationGuard]},
  { path: 'user/auctions', component: UserAuctionsComponent},
  { path: 'search', component: SearchListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthenticationGuard, AdministrationGuard]
})
export class AppRoutingModule { }
