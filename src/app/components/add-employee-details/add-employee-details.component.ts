import { FormControl, FormsModule, NgModel } from '@angular/forms';
import { IndexedDbService } from '../../services/indexed-db.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CommonModule,
  formatDate,
  NgClass,
  NgFor,
  NgStyle,
} from '@angular/common';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { MatSelectModule } from '@angular/material/select';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  inject,
  Input,
  NO_ERRORS_SCHEMA,
  OnInit,
  Output,
  signal,
  viewChild,
} from '@angular/core';
import {
  MatCalendarCellClassFunction,
  MatDatepickerIntl,
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
import { elementAt, map, startWith, takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { EmployeeListComponent } from '../employee-list/employee-list.component';
import { DataService } from '../../services/data.service';

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
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatNativeDateModule,
    MatIconModule,
    MatBottomSheetModule,
    MatInputModule,
  ],
  providers: [
    EmployeeListComponent,
    AddEmployeeDetailsComponent,
    MatCalendar,
    provideNativeDateAdapter(),
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-employee-details.component.html',
  styleUrl: './add-employee-details.component.scss',
})
export class AddEmployeeDetailsComponent implements OnInit {
  customHeader = customHeader;
  customHeader2 = customHeader2;
  // selected_end_date: Date | null = null;
  selected_end_date: any;
  selected_start_date: any;
  private _bottomSheet = inject(MatBottomSheet);
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;
  startDateChangedFlag: boolean = false;
  endDateChangedFlag: boolean = false;
  selected: any;
  roll: any;
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
  roles: any = {
    id: '',
    name: '',
  };
  isEditMode: boolean = false;
  selectedValue: any;
  role_name: any;
  selected_role_name: any;
  selected_date: Date | null = null;
  selectedStartDateFromCalendarObj: any = { date: '' };
  @Input() selectedDate: any;
  selectedEndDateObj: any = { enddate: '' };

  constructor(
    private route: ActivatedRoute,
    private employeeService: IndexedDbService,
    private router: Router,
    private empListComponent: EmployeeListComponent,
    private bottomSheet: MatBottomSheet,
    private cdr: ChangeDetectorRef,
    private dateService: DataService,
    private calendar: MatCalendar<Date>
  ) {
    this.roles = this.getAllRoles();
  }

  ngOnInit(): void {
    this.dateService.selectedDate$.subscribe((selected_start_calendar_date: any) => {
      if (selected_start_calendar_date) {
        this.selectedStartDateFromCalendarObj = { date: selected_start_calendar_date };
        this.employee.start_date = this.selectedStartDateFromCalendarObj.date;
        this.selected_start_date = moment(selected_start_calendar_date).format(
          'D MMM YYYY'
        );
      }
    });
    this.dateService.selectedDate2$.subscribe((selectedEndDate: any) => {
      if (selectedEndDate) {
        this.selectedEndDateObj = { enddate: selectedEndDate };
        this.employee.end_date = this.selectedEndDateObj.enddate;
        if (this.selectedEndDateObj.enddate != 'No Date Selected')
          this.selected_end_date = moment(this.selectedEndDateObj.enddate).format(
            'D MMM YYYY'
          );
        else this.selected_end_date = 'No Date Selected';
      }
    });
    this.route.queryParams.subscribe(async (params: any) => {
      if (params['data']) {
        this.isEditMode = true;
        const convert_params_to_object = new URLSearchParams(params.data);
        this.employee = Object.fromEntries(convert_params_to_object.entries());

        if (this.roles) {
          for (let i = 0; i < this.roles.length; i++) {
            if (this.roles[i].id == this.employee.role_id) {
              this.employee.role = this.roles[i].name;
              this.roleId = this.roles[i].id;
            }
          }
        }
      }
    });
  }

  getAllRoles() {
    this.employeeService.getRoles();
  }
  addRoles() {
    this.employeeService.addRoles().then((role) => {
      console.log('role', role);
    });
  }
  saveEmployee() {
    debugger;
    if (this.isEditMode) {
      const employeeObject = {
        name: this.employee.name,
        role: this.employee.role,
        role_id: this.roleId,
        start_date: this.employee.start_date,
        end_date: this.employee.end_date,
      };

      this.employeeService
        .editEmpData(parseInt(this.employee.id, 10), employeeObject)
        .then(() => {
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
        end_date: this.employee.end_date,
      };
      this.employeeService.addEmployee(employeeObject).then(() => {
        this._snackBar.openFromComponent(AddSnackBarComponent, {
          duration: this.durationInSeconds * 1000,
        });
      });

      this.router.navigate(['/']);
    }
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
  onDatePickerOpen(){
    debugger
   
  }
  onSaveStartDate() {
    debugger
  
   if (this.selectedStartDateFromCalendarObj) {
      this.employee.start_date =
        this.selectedStartDateFromCalendarObj.date.toISOString();
    } else {
      this.onStartDateChange('');
    }
  }
  onSaveEndDate() {
    if (this.selectedEndDateObj.enddate) {
      this.employee.end_date = this.selectedEndDateObj.enddate.toISOString();
    } else {
      this.onEndDateChange('');
    }
  }

  onStartDateChange(event: any) {
    debugger
    this.employee.start_date = event.target.value.toISOString();
    this.selected_start_date=  moment(event.target.value).format(
      'D MMM YYYY'
    );
  }
  onEndDateChange(event: any) {
    this.employee.end_date = event.target.value.toISOString();
  }
  openBottomSheet(): void {
    debugger;
    const bottomSheetRef = this.bottomSheet.open(BottomSheetComponent);
    bottomSheetRef.afterDismissed().subscribe((result: any) => {
      if (result) {
        this.employee.role = result.role_name;
        this.roleId = result.role_id;
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    });
  }
  deleteEmpRecord() {
    this.empListComponent.deleteEmployee(parseInt(this.employee.id, 10));
    this.router.navigate(['/list']);
  }
}
/** Custom header component for datepicker. */
@Component({
  selector: 'customHeader',
  standalone: true,
  providers: [CommonModule],

  styles: [
    `
      .custom-header {
        padding: 0.5em;
        text-align: center;
        margin-bottom: 10px;
      }

      .custom-header-label {
        flex: 1;
        height: 1em;
        font-weight: 500;
        text-align: center;
      }
      .custom-header span {
        font-size: 15px;
      }
      .custom-header img {
        width: 31px;
      }
      .btn-grp {
        display: grid;
        grid-template-columns: repeat(2, 1fr); /* 2 buttons per row */
        gap: 10px; /* Space between buttons */
      }
      /* Buttons */
      button {
        width: 100%;
        font-size: 16px;
        padding: 10px;
      }

      /* Responsive for smaller screens (max-width: 600px) */
      @media (max-width: 600px) {
        .button-container {
          grid-template-columns: 1fr; /* 1 button per row for small screens */
        }

        button {
          font-size: 14px; /* Adjust font size */
          padding: 8px; /* Adjust padding */
        }
      }

      // keep button in active state
      button.active {
        background-color: #0d6efd;
        color: white !important;
      }
    `,
  ],
  template: `
    <div class="btn-grp">
      <button
        type="button"
        class="btn btn-light text-primary "
        *ngFor="let btn of buttons; let i = index"
        [ngClass]="{ active: activeButtonIndex === i }"
        (click)="setActiveButton(i)"
      >
        {{ btn }}
      </button>
    </div>
    <div class="custom-header">
      <img
        src="assets/arrow_left_26dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg"
        alt=""
        class="arrow-left"
        (click)="previousClicked('month')"
      />
      <span class="custom-header-label" (click)="periodClicked()">{{
        periodLabel()
      }}</span>
      <img
        src="assets/arrow_right_26dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg"
        alt=""
        (click)="nextClicked('month')"
      />
    </div>
  `,
  imports: [MatButtonModule, MatIconModule, NgClass, NgFor, MatDatepicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class customHeader<D> implements OnDestroy {
  buttons: string[] = ['Today', 'Next Monday', 'Next Tuesday', 'After 1 Week'];
  activeButtonIndex: number | null = null;
  selectedDate: Date | null = null;
  private _calendar = inject<MatCalendar<D>>(MatCalendar);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  private _dateFormats = inject(MAT_DATE_FORMATS);
  private _destroyed = new Subject<void>();
  readonly periodLabel = signal('');
  @Output() dateSelected = new EventEmitter<string>();

  constructor(
    private calendar: MatCalendar<Date>,
    public intl: MatDatepickerIntl,
    private dateService: DataService
  ) {
    this._calendar.stateChanges
      .pipe(startWith(null), takeUntil(this._destroyed))
      .subscribe(() => {
        this.periodLabel.set(
          this._dateAdapter
            .format(
              this._calendar.activeDate,
              this._dateFormats.display.monthYearLabel
            )
            .toLocaleUpperCase()
        );
      });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  setActiveButton(index: number): void {
    this.activeButtonIndex = index;
    if (index == 0) this.selectToday();
    if (index == 1) this.selectNextMonday();
    if (index == 2) this.selectNextTuesday();
    if (index == 3) this.selectOneWeekLater();
  }
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
  periodClicked(): void {
    this.calendar.currentView = 'multi-year'; // Show year view
  }

  // Function to set today's date and close the datepicker
  selectToday(): void {
    debugger;
    const today: any = this._dateAdapter.today();
    this._calendar.activeDate = today; // Highlight today's date in the calendar
    this._calendar.selected = today; // Set today's date as selected
    this.dateService.setSelectedDate(this._calendar.selected);
  }
  // Function to select next Monday
  selectNextMonday(): void {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
    const daysToNextMonday = (8 - dayOfWeek) % 7; // Calculate how many days to the next Monday (0 if today is Monday)

    // Set the next Monday
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysToNextMonday);
    this.calendar.activeDate = nextMonday;
    this.calendar.selected = nextMonday;
    this.dateService.setSelectedDate(this.calendar.selected);
  }
  selectNextTuesday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, 2 = Tuesday, etc.)
    const daysToNextTuesday = (9 - dayOfWeek) % 7; // Calculate how many days to the next Tuesday (0 if today is Tuesday)

    // Set the next Tuesday
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysToNextTuesday);
    this.calendar.activeDate = nextTuesday;
    this.calendar.selected = nextTuesday; // Set the selected date to next Tuesday
    this.dateService.setSelectedDate(this.calendar.selected);
  }
  // Function to select one week later (7 days after today)
  selectOneWeekLater(): void {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7); // Add 7 days to today's date

    // Set the selected and active date to one week later
    this.calendar.activeDate = oneWeekLater;
    this.calendar.selected = oneWeekLater;
    this.dateService.setSelectedDate(this.calendar.selected);
  }
}

// Header 2
@Component({
  selector: 'customHeader2',
  standalone: true,
  providers: [CommonModule],

  styles: [
    `
      .custom-header {
        padding: 0.5em;
        text-align: center;
        margin-bottom: 10px;
      }

      .custom-header-label {
        flex: 1;
        height: 1em;
        font-weight: 500;
        text-align: center;
      }
      .custom-header span {
        font-size: 15px;
      }
      .custom-header img {
        width: 31px;
      }
      .btn-grp {
        display: grid;
        grid-template-columns: repeat(2, 1fr); /* 2 buttons per row */
        gap: 10px; /* Space between buttons */
      }
      /* Buttons */
      button {
        width: 100%;
        font-size: 16px;
        padding: 10px;
      }

      /* Responsive for smaller screens (max-width: 600px) */
      @media (max-width: 600px) {
        .button-container {
          grid-template-columns: 1fr; /* 1 button per row for small screens */
        }

        button {
          font-size: 14px; /* Adjust font size */
          padding: 8px; /* Adjust padding */
        }
      }

      // keep button in active state
      button.active {
        background-color: #0d6efd;
        color: white !important;
      }
    `,
  ],
  template: `
    <div class="btn-grp">
      <button
        type="button"
        class="btn btn-light text-primary "
        *ngFor="let btn of buttons; let i = index"
        [ngClass]="{ active: activeButtonIndex === i }"
        (click)="setActiveButton(i)"
      >
        {{ btn }}
      </button>
    </div>
    <div class="custom-header">
      <img
        src="assets/arrow_left_26dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg"
        alt=""
        class="arrow-left"
        (click)="previousClicked('month')"
      />
      <span class="custom-header-label" (click)="periodClicked()">{{
        periodLabel()
      }}</span>
      <img
        src="assets/arrow_right_26dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg"
        alt=""
        (click)="nextClicked('month')"
      />
    </div>
  `,
  imports: [MatButtonModule, MatIconModule, NgClass, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class customHeader2<D> implements OnDestroy {
  buttons: string[] = ['No Date', 'Today'];
  activeButtonIndex: number | null = null;
  private _calendar2 = inject<MatCalendar<D>>(MatCalendar);
  private _dateAdapter2 = inject<DateAdapter<D>>(DateAdapter);
  private _dateFormats = inject(MAT_DATE_FORMATS);
  private _destroyed = new Subject<void>();
  readonly periodLabel = signal('');
  // @Inject(MAT_DATE_FORMATS) private dateFormats: MatDateFormats

  constructor(
    private calendar: MatCalendar<Date>,
    public intl: MatDatepickerIntl,
    private dateService: DataService
  ) {
    this._calendar2.stateChanges
      .pipe(startWith(null), takeUntil(this._destroyed))
      .subscribe(() => {
        this.periodLabel.set(
          this._dateAdapter2
            .format(
              this._calendar2.activeDate,
              this._dateFormats.display.monthYearLabel
            )
            .toLocaleUpperCase()
        );
      });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  setActiveButton(index: number): void {
    this.activeButtonIndex = index;
    if (this.activeButtonIndex == 0) {
      this.nodateSelected();
    } else {
      this.selectToday();
    }
  }
  previousClicked(mode: 'month' | 'year') {
    this._calendar2.activeDate =
      mode === 'month'
        ? this._dateAdapter2.addCalendarMonths(this._calendar2.activeDate, -1)
        : this._dateAdapter2.addCalendarYears(this._calendar2.activeDate, -1);
  }

  nextClicked(mode: 'month' | 'year') {
    this._calendar2.activeDate =
      mode === 'month'
        ? this._dateAdapter2.addCalendarMonths(this._calendar2.activeDate, 1)
        : this._dateAdapter2.addCalendarYears(this._calendar2.activeDate, 1);
  }
  periodClicked(): void {
    this.calendar.currentView = 'multi-year'; // Show year view
  }

  // Function to set today's date and close the datepicker
  selectToday(): void {
    debugger;
    const today = this._dateAdapter2.today();
    this._calendar2.activeDate = today;
    this._calendar2.selected = today;
    this.dateService.setSelectedEndDate(this._calendar2.selected);
  }
  nodateSelected() {
    this._calendar2.selected = null;
    this.dateService.setSelectedEndDate('No Date Selected');
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
  standalone: true,
  selector: 'BottomSheetComponent',
  styles: `
    li{
      padding: 20px;
      font-weight: 400;
      font-size: 16px;
    }
  `,
  imports: [NgFor],
  templateUrl: 'bottom-sheet-overview-example.html',
})
export class BottomSheetComponent {
  roles: any;
  roleId: any;
  role_name: any;
  constructor(
    private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>,
    private employeeService: IndexedDbService
  ) {
    this.employeeService.getRoles().then((roles: any) => {
      this.roles = roles;
      console.log(this.roles);
    });
  }
  selectedEmployeeName(role_name: any) {
    debugger;
    for (let i = 0; i < this.roles.length; i++) {
      if (this.roles[i].name == role_name) {
        this.roleId = this.roles[i].id;

        this.role_name = role_name;
      }
    }
    var selectedRoleObjectFromBottomSheet = {
      role_name: this.role_name,
      role_id: this.roleId,
    };
    this.bottomSheetRef.dismiss(selectedRoleObjectFromBottomSheet);
  }
}
