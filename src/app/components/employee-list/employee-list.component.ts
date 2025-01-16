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
    // swipe delete button 
    const swipeContainers:any = document.querySelectorAll('.swipe-container');
    
    swipeContainers.forEach((container:any) => {
      let startX = 0;
      let isSwiping = false;
    
      container.addEventListener('touchstart', (e:any) => {
        startX = e.touches[0].clientX;
        isSwiping = true;
      });
    
      container.addEventListener('touchmove', (e:any) => {
        if (!isSwiping) return;
        const diffX = e.touches[0].clientX - startX;
        if (diffX < 0) {
          container.style.transform = `translateX(${Math.max(diffX, -80)}px)`; // Limit swipe distance
        }
      });
    
      container.addEventListener('touchend', () => {
        isSwiping = false;
        const currentTransform = parseInt(container.style.transform.replace('translateX(', '')) || 0;
        if (currentTransform < -40) {
          container.style.transform = 'translateX(-80px)';
        } else {
          container.style.transform = 'translateX(0)';
        }
      });
    });
    
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
        console.log("this.getAllEmpList",this.getAllEmpList); 
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

}
@Component({
  selector: 'snackBarComponent',
  template: ` <span>Record deleted successfully ! </span> `,
  styles: ``,
})
export class snackBarComponent {
  snackBarRef = inject(MatSnackBarRef);
}
