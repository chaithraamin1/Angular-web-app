import { FormControl, FormsModule } from '@angular/forms';
import { IndexedDbService } from '../../services/indexed-db.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  NO_ERRORS_SCHEMA,
  signal,
  viewChild,
} from '@angular/core';
import {
  MatCalendarCellClassFunction,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { ChangeDetectorRef, Inject, OnDestroy } from '@angular/core';
import { MatCalendar, MatDatepicker } from '@angular/material/datepicker';
import { MatDateFormats } from '@angular/material/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { EmployeeListComponent } from '../employee-list/employee-list.component';


const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-employee-details',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatNativeDateModule,
    MatIconModule,
    MatBottomSheetModule
  ],
  providers: [
     EmployeeListComponent,
      provideNativeDateAdapter(),
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-employee-details.component.html',
  styleUrl: './add-employee-details.component.scss',
})
export class AddEmployeeDetailsComponent {
  readonly customHeader = customHeader;
  private _bottomSheet = inject(MatBottomSheet);
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;
 
  date = new FormControl(moment());
  roleId!: number;
  employee: any = [
    {
      name: '',
      role: '',
      start_ate: '',
      end_date: '',
    },
  ];
  roles: any = [
    { id: 1, name: 'Product Designer' },
    { id: 2, name: 'Flutter Developer' },
    { id: 3, name: 'QA Tester' },
    { id: 4, name: 'Product Owner' },
  ];
  isEditMode: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private employeeService: IndexedDbService,
    private router: Router,
    private empListComponent:EmployeeListComponent
  ) {
    // window.onload = () => {
    //   const today: any = new Date();
    //   const calendarDays: any = document.getElementById('calendar-days');
    //   var currentMonth: any = document.getElementById('current-month');
    //   var currentDate: any = new Date();
    //   var today1 = document.getElementById('today') as any;
    //   if (today1) {
    //     today1.addEventListener('click', () => {
    //       currentDate = new Date();
    //       this.renderCalendar(currentDate);
    //     });
    //   }
    //   var nextMonday = document.getElementById('next-monday') as any;
    //   if (nextMonday) {
    //     nextMonday.addEventListener('click', () => {
    //       const nextMonday = new Date();
    //       nextMonday.setDate(
    //         today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7)
    //       );
    //       currentDate = nextMonday;
    //       this.renderCalendar(currentDate);
    //     });
    //   }
    //   var nextTuesday = document.getElementById('next-tuesday') as any;
    //   if (nextTuesday) {
    //     nextTuesday.addEventListener('click', () => {
    //       const nextTuesday = new Date();
    //       nextTuesday.setDate(
    //         today.getDate() + ((2 + 7 - today.getDay()) % 7 || 7)
    //       );
    //       currentDate = nextTuesday;
    //       this.renderCalendar(currentDate);
    //     });
    //   }
    //   var afterOneWeek = document.getElementById('after-one-week') as any;
    //   if (afterOneWeek) {
    //     afterOneWeek.addEventListener('click', () => {
    //       const nextWeek = new Date(today);
    //       nextWeek.setDate(today.getDate() + 7);
    //       currentDate = nextWeek;
    //       this.renderCalendar(currentDate);
    //     });
    //   }
    //   // Navigation
    //   var prevMonth = document.getElementById('prev-month') as any;
    //   if (prevMonth) {
    //     prevMonth.addEventListener('click', () => {
    //       currentDate.setMonth(currentDate.getMonth() - 1);
    //       this.renderCalendar(currentDate);
    //     });
    //   }
    //   var nextMonth = document.getElementById('next-month') as any;
    //   if (nextMonth) {
    //     nextMonth.addEventListener('click', () => {
    //       currentDate.setMonth(currentDate.getMonth() + 1);
    //       this.renderCalendar(currentDate);
    //     });
    //   }
    //   this.renderCalendar(currentDate);
    // };
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params: any) => {
      if (params['data']) {
        this.isEditMode = true;
        const convert_params_to_object = new URLSearchParams(params.data);
        this.employee = Object.fromEntries(convert_params_to_object.entries());
        console.log(this.employee);
        for (let i = 0; i < this.roles.length; i++) {
          if (this.roles[i].id == this.employee.role_id) {
            this.employee.role = this.roles[i].name;
            this.roleId = this.roles[i].id;
          }
        }
      }
    });
  }

  saveEmployee(): void {
    debugger
    if (this.isEditMode) {
      const employeeObject = {
        name: this.employee.name,
        role: this.employee.role,
        role_id: this.roleId,
        start_date: this.employee.start_date,
        end_date: this.employee.end_date,
      };
      this.employeeService.editEmpData( parseInt(this.employee.id,10),employeeObject).then(() => {
        this._snackBar.openFromComponent(EditsnackBarComponent, {
          duration: this.durationInSeconds * 1000,
        });
      });

      this.router.navigate(['/']);
    } else {
      const employeeObject = {
        name: this.employee.name,
        role: this.employee.role,
        role_id: this.roleId,
        start_date: this.employee.start_date,
        end_date: this.employee.end_date
      };
      this.employeeService
        .addEmployee(employeeObject)
        .then(()=>{
          this._snackBar.openFromComponent(AddSnackBarComponent, {
            duration: this.durationInSeconds * 1000,
          });
        })
  

      this.router.navigate(['/']);
    }
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
  selectedEmployeeName(event: any) {
    for (let i = 0; i < this.roles.length; i++) {
      if (this.roles[i].name == event.target.value) {
        this.roleId = this.roles[i].id;
      }
    }
  }
  onStartDateChange(event:any){
    this.employee.start_date = event.target.value.toISOString();
  }
  onEndDateChange(event:any){
   this.employee.end_date = event.target.value.toISOString();
  }
  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }
  deleteEmpRecord(){
    this.empListComponent.deleteEmployee(parseInt(this.employee.id,10))
    this.router.navigate(['/list'])
  }
}
/** Custom header component for datepicker. */
@Component({
  selector: 'customHeader',
  styles: [
    `
      .quick-actions {
        margin-top: 4px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        padding: 0px 5px;

        button {
          flex: 1 1 calc(50% - 8px);
          margin-bottom: 8px;
        }
      }
      .example-header {
        display: flex;
        align-items: center;
        padding: 0.5em;
      }

      .example-header-label {
        flex: 1;
        height: 1em;
        font-weight: 500;
        text-align: center;
      }

      .example-double-arrow .mat-icon {
        margin: -22%;
      }
    `,
  ],
  template: `
    <div class="quick-actions">
      <button
        type="button"
        class="btn text-primary bg-light"
        (click)="setToday()"
      >
        Today
      </button>
      <button
        type="button"
        class="btn text-primary bg-light"
        (click)="setNextMonday()"
      >
        Next Monday
      </button>
      <button
        type="button"
        class="btn text-primary bg-light"
        (click)="setNextTuesday()"
      >
        Next Tuesday
      </button>
      <button
        type="button"
        class="btn text-primary bg-light"
        (click)="setAfterOneWeek()"
      >
        After 1 Week
      </button>
    </div>

    <div class="example-header">
      <i class="material-icons" (click)="previousClicked('year')"
        >keyboard_arrow_left</i
      >
      <i class="material-icons" (click)="previousClicked('month')"
        >keyboard_arrow_left</i
      >
      <span class="example-header-label">{{ periodLabel() }}</span>
      <i class="material-icons" (click)="nextClicked('month')"
        >keyboard_double_arrow_left</i
      >
      <i class="material-icons" (click)="nextClicked('year')"
        >keyboard_double_arrow_right</i
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class customHeader<D = null> implements OnDestroy {
  readonly picker = viewChild.required<MatDatepicker<Date>>('today');
  selectedDate: Date | null = null;
  private _calendar = inject<MatCalendar<D>>(MatCalendar);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  private _dateFormats = inject(MAT_DATE_FORMATS);
  private _destroyed = new Subject<void>();
  readonly periodLabel = signal('');
  _datePicker: any;
 
  constructor(){}

 public todayClicked() {
    this._calendar.activeDate = this._dateAdapter.today();
    //  this._calendar._dateSelected(this._calendar.activeDate);
    this._datePicker.select(this._dateAdapter.today());
    this._datePicker.close();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  // periodLabel() {
  //   return this._dateAdapter
  //     .format(
  //       this._calendar.activeDate,
  //       this._dateFormats.display.monthYearLabel
  //     )
  //     .toLocaleUpperCase();
  // }

  previousClicked(mode: 'month' | 'year') {
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, -1);
  }

  nextClicked(mode: 'month' | 'year') {
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, 1);
  }
  setToday() {
    this._calendar.activeDate = this._dateAdapter.today();
    // this._calendar._dateSelected(this._calendar.activeDate);
    this._datePicker.select(this._dateAdapter.today());
    this._datePicker.close();

  }
  setNextMonday() {
    const today = new Date();
    var nextMonday = new Date(
      today.setDate(today.getDate() + ((8 - today.getDay()) % 7 || 7))
    );

    this._datePicker.close();
  }
  setNextTuesday() {
    const today = new Date();
    const nextTuesday = new Date(
      today.setDate(today.getDate() + ((9 - today.getDay()) % 7 || 7))
    );
    // this.selectedDate = nextTuesday;
  }
  setAfterOneWeek() {
    const today = new Date();
    const afterOneWeek = new Date(today.setDate(today.getDate() + 7));
    // this.selectedDate = afterOneWeek;
  }
}
@Component({
  selector: 'EditsnackBarComponent',
  template: ` <span>Record updated successfully ! </span> `,
  styles: ``,
})
export class EditsnackBarComponent {}

@Component({
  selector: 'AddSnackBarComponent',
  template: ` <span>Record added successfully ! </span> `,
  styles: ``,
})
export class AddSnackBarComponent {}

// bottom sheet component
@Component({
  selector: 'BottomSheetComponent',
  providers:[],
  template:`<span>Hiiii</span>`,
  
})
export class BottomSheetComponent {
  private _bottomSheetRef =
    inject<MatBottomSheetRef<BottomSheetComponent>>(MatBottomSheetRef);

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}

