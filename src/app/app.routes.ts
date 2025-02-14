import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/auth/login/login.component";
import { RegisterComponent } from "./pages/auth/register/register.component";
import { BankNewsComponent } from "./pages/bank-news/bank-news.component";
import { inject } from "@angular/core";
import { AuthGuard } from "./guards/auth.guard";
import { AnnonceListComponent } from "./components/annonces/annonce-list/annonce-list.component";
import { AnnonceDetailComponent } from "./components/annonces/annonce-detail/annonce-detail.component";
import { CreateAnnonceComponent } from "./components/annonces/create-annonce/create-annonce.component";

export const routes: Routes = [

  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: 'ebanky-news',
    component: BankNewsComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'home',
    component: AnnonceListComponent,

  },
  {
    path: 'create-annonce',
    component: CreateAnnonceComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'annonces/:id',
    component: AnnonceDetailComponent,
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
