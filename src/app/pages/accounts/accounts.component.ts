import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CardAccountsComponent } from '../../components/account/card-accounts/card-accounts.component';
import { ListAccountsComponent } from '../../components/account/list-accounts/list-accounts.component';
import { GridAccountsComponent } from '../../components/account/grid-accounts/grid-accounts.component';
import { FormAccountsComponent } from '../../components/account/form-accounts/form-accounts.component';
import { Account } from '../../models/account/account';
import { NgOptimizedImage } from '@angular/common';
import { AddIconComponent } from '../../components/icons/add-icon/add-icon.component';
import { AccountService } from '../../services/account.service';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { DisplayingErrorComponent } from '../../components/displaying-error/displaying-error.component';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accounts',
  imports: [
    FormsModule, ListAccountsComponent, GridAccountsComponent, AddIconComponent,
    SearchInputComponent, SkeletonComponent, DisplayingErrorComponent,
    RouterModule
  ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent {
  isListDisplay: boolean = true;
  accounts: Account[] = [];
  ebankyCarts: string[] = ["images/00c93f4f-27ae-4dd8-a4ff-42e34ae9a05e.png", "images/3ff46bbf-5e1d-4db0-8489-8aa95dddccc9.png", "images/91cb0e81-1b91-4f35-8801-c4115c61556c.png", "images/bb979f39-af8a-4623-8b71-174d6f67ecfd.png" ]
  errorMessage: string = "something happend on loading data";

  displayGrid(state: boolean){
    this.isListDisplay = state;
  }

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.getAllAccounts();
  }

  getAllAccounts(){
    this.accountService.getAllAccounts().subscribe({
      next: (res) => {
        this.accounts= res;
      },
      error: (err) => console.log(err),
      complete: () => console.log("complete"),
    })
  }


  deleteAccount(id: string) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.accountService.deleteAccount(id).subscribe({
          next: () => {
            Swal.fire({
              title: "Deleted!",
              text: "The Account has been deleted.",
              icon: "success"
            });
            this.getAllAccounts();
          },
          error: (err) => {
            Swal.fire({
              title: "Error!",
              text: "Failed to delete account. Please try again.",
              icon: "error"
            });
          },
          complete: () => {
            console.log('Delete operation completed');
          }
        });
      }
    });
  }
}
