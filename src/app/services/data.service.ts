import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dateSource = new BehaviorSubject<Date | null>(null); 
  selectedDate$ = this.dateSource.asObservable(); 

  private dateSource2 = new BehaviorSubject<Date | null>(null); 
  selectedDate2$ = this.dateSource2.asObservable(); 
  constructor() { }
  setSelectedDate(selected_calendar_date:any): void {
    this.dateSource.next(selected_calendar_date);
  }
  setSelectedEndDate(selected_end_date:any): void {
    this.dateSource2.next(selected_end_date);
  }
}
