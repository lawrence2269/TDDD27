import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ManageUsersService {

  constructor(private http: HttpClient) { }

  //private baseURL:string = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  fetchUsers(){
    return this.http.get(this.baseURL+"/admin/users").pipe(map(result=>{
      return result;
    }));
  }

  deleteUsers(data:any){
    return this.http.post<any>(this.baseURL+"/admin/deleteuser",data).pipe(map(result=>{
      return result;
    }));
  }
}
