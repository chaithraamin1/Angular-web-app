import { Component, inject, InjectionToken } from '@angular/core';
import { Router } from '@angular/router';
import { IndexedDbService } from '../../services/indexed-db.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent {
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;
  getAllEmpList: any;
  empListLength: any;
  constructor(
    private router: Router,
    private employeeService: IndexedDbService
  ) {}
  ngOnInit() {
    this.read();
    this.getAllEmployees();
  }
  addEmployeeDetails() {
    this.router.navigate(['/add']);
  }
  getAllEmployees() {
    this.employeeService
      .getEmployees()
      .then((data: any) => {
        this.getAllEmpList = data;
        this.empListLength = this.getAllEmpList.length;
      })
      .catch((error: any) => {
        // this.toastr.success('Error while fetching data');
      });
  }
  deleteEmployee(empId: any) {
    this.employeeService
      .deleteEmpData(empId)
      .then((data: any) => {
        this.getAllEmployees();

        this._snackBar.openFromComponent(snackBarComponent, {
          duration: this.durationInSeconds * 1000,
        });
      })

      .catch((error: any) => {
     
      });
  }
  editEmpData(employee: any) {
    const queryString = new URLSearchParams(employee).toString();
    this.router.navigate(['/add'], { queryParams: { data: queryString } });
  }
  read(){
     this.employeeService.readAll().then((data:any)=>{
       console.log('d',data)
     })
  }
}
@Component({
  selector: 'snackBarComponent',
  template: ` <span>Record deleted successfully ! </span> `,
  styles: ``,
})
export class snackBarComponent {
  snackBarRef = inject(MatSnackBarRef);
}
