import { Routes } from '@angular/router';
import { AddEmployeeDetailsComponent } from './components/add-employee-details/add-employee-details.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';


export const routes: Routes = [
   { path: 'add', component: AddEmployeeDetailsComponent }, 
    {path:'list',component:EmployeeListComponent},
    {path:'',component:EmployeeListComponent},

];
