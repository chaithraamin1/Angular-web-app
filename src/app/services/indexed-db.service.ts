import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbName = 'EmployeeDB';
  // private db: IDBDatabase | null = null;

  constructor() {}
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('employees')) {
          db.createObjectStore('employees', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(`Error opening database: ${event.target.errorCode}`);
      };
    });
  }

  addEmployee(employeeObject: any) {
    return this.openDatabase().then((db: any) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('employees', 'readwrite');
        const store = transaction.objectStore('employees');
        const request = store.add(employeeObject);

        request.onsuccess = () => resolve('Data added successfully');
        request.onerror = (event: any) =>
          reject(`Error adding data: ${event.target.errorCode}`);
      });
    });
  }

  getEmployees() {
    return this.openDatabase().then((db: any) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('employees', 'readonly');
        const store = transaction.objectStore('employees');
        const request = store.getAll();

        request.onsuccess = (event: any) => resolve(event.target.result);
        request.onerror = (event: any) =>
          reject(`Error fetching all data: ${event.target.errorCode}`);
      });
    });
  }
  deleteEmpData(id: any) {
    return this.openDatabase().then((db: any) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('employees', 'readwrite');
        const store = transaction.objectStore('employees');
        const request = store.delete(id);

        request.onsuccess = () => resolve('Data deleted successfully');
        request.onerror = (event: any) =>
          reject(`Error deleting data: ${event.target.errorCode}`);
      });
    });
  }
  editEmpData(id: any, employee: any) {
    return this.openDatabase().then((db: any) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('employees', 'readwrite');
        const store = transaction.objectStore('employees');
        const getRequest = store.get(id);

        console.log('getRequest', getRequest);
        getRequest.onsuccess = () => {
          const existingData = getRequest.result;
          if (!existingData) {
            reject(`No data found for key: ${id}`);
            return;
          }

          // Update the data
          const updatedRecord = { ...existingData, ...employee };
          const putRequest = store.put(updatedRecord);

          putRequest.onsuccess = () => {
            console.log('Data updated successfully!');
            resolve(updatedRecord);
          };

          putRequest.onerror = (event: any) => {
            console.error('Error updating data:', event.target.errorCode);
            reject(event.target.errorCode);
          };
        };

        getRequest.onerror = (event: any) => {
          console.error('Error retrieving data:', event.target.errorCode);
          reject(event.target.errorCode);
        };
      });
    });
  }

  readAll(): Promise<any[]> {
    return this.openDatabase().then((db: any) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('employees', 'readonly');
        const store = transaction.objectStore('employees');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };

        getAllRequest.onerror = () => {
          reject(getAllRequest.error);
        };
      });
    });
  }
}
