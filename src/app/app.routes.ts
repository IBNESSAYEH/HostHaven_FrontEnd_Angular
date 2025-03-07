import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/auth/login/login.component";
import { RegisterComponent } from "./pages/auth/register/register.component";
import { BankNewsComponent } from "./pages/bank-news/bank-news.component";
import { inject } from "@angular/core";
import { AuthGuard } from "./guards/auth.guard";
import { AnnonceListComponent } from "./components/annonces/annonce-list/annonce-list.component";
import { AnnonceDetailComponent } from "./components/annonces/annonce-detail/annonce-detail.component";
import { CreateAnnonceComponent } from "./components/annonces/create-annonce/create-annonce.component";
import { HomeComponent } from "./components/home/home.component";
import { UpdateAnnonceComponent } from "./components/annonces/update-annonce/update-annonce.component";
import { ProfileComponent } from "./components/user-profile/profile/profile.component";
import { HostDashboardComponent } from "./components/dashboards/host-dashboard/host-dashboard.component";
import { AdminDashboardComponent } from "./components/dashboards/admin-dashboard/admin-dashboard.component";
import { AdminGuard } from "./guards/admin-guard.guard";
import { BookingComponent } from "./components/booking/booking.component";
import { BookingSuccessComponent } from "./components/booking-success/booking-success/booking-success.component";
import { MyBookingsComponent } from "./components/my-bookings/my-bookings/my-bookings.component";

export const routes: Routes = [

  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'ebanky-news',
    component: BankNewsComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: '',
    component: HomeComponent,

  },
  {
    path: 'annonces/create',
    component: CreateAnnonceComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'annonces/edit/:id',
    component: UpdateAnnonceComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'annonce-list',
    component: AnnonceListComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'annonces/:id',
    component: AnnonceDetailComponent,
  },{
    path: 'dashboard/host',
    component: HostDashboardComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },{
    path: 'dashboard/admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'annonces/:id/book',
    component: BookingComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'booking-success',
    component: BookingSuccessComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'bookings',
    component: MyBookingsComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
