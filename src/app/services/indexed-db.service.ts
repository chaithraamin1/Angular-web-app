import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbName = 'EmployeeDB';
  newVersion = 2;

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.newVersion);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('employees')) {
          db.createObjectStore('employees', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
        if (!db.objectStoreNames.contains('roles')) {
          db.createObjectStore('roles', {
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
  getRoles(){
    return this.openDatabase().then((db: any) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('roles', 'readonly');
        const store = transaction.objectStore('roles');
        const request = store.getAll();
        // const request = store.clear();
        request.onsuccess = (event: any) => resolve(event.target.result);
        request.onerror = (event: any) =>
          reject(`Error fetching all roles: ${event.target.errorCode}`);
      });
    });
   }

  addRoles() {
    return this.openDatabase().then((db: any) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('roles', 'readwrite');
        const store = transaction.objectStore('roles');
        
        // Data to add to the 'roles' table
        const rolesData = [
          { name: 'Product Designer' },
          { name: 'Flutter Developer' },
          { name: 'QA Tester' },
          { name: 'Product Owner' }
        ];

        rolesData.forEach((role) => {
          const addRequest = store.add(role);

          addRequest.onsuccess = () => {
            console.log(`Role added: ${role.name}`);
          };

          addRequest.onerror = (event: any) => {
            console.error(
              `Failed to add role: ${role.name}`,
              event.target.error
            );
          };
        });

        const request = store.getAll();

        transaction.oncomplete = () => {
          console.log('All roles added successfully.');
        };

        transaction.onerror = (event: any) => {
          console.error('Transaction failed:', event.target.error);
        };

        request.onerror = (event: any) => {
          console.error('Error opening database:', event.target.error);
        };
      });
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
