import { UsersService } from './../../services/users.service';
import { Component } from '@angular/core';
import {  UserData } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { ListUsersComponent } from '../../components/users/list-users/list-users.component';
import { GridUsersComponent } from '../../components/users/grid-users/grid-users.component';
import { AddIconComponent } from '../../components/icons/add-icon/add-icon.component';
import { DisplayingErrorComponent } from '../../components/displaying-error/displaying-error.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';

@Component({
  selector: 'app-users',
   imports: [
      FormsModule, ListUsersComponent, GridUsersComponent, AddIconComponent,
      SearchInputComponent, SkeletonComponent, DisplayingErrorComponent
    ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
isListDisplay: boolean = true;
  users: UserData[] = [];
  errorMessage: string = "something happend on loading data";

  displayGrid(state: boolean){
    this.isListDisplay = state;
  }

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers(){
    this.usersService.getAllUsers().subscribe({
      next: (res) => {
        this.users= res;
        console.log(res)
      },
      error: (err) => console.log(err),
      complete: () => console.log("complete"),
    })
  }
}
