import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

  constructor(private http: HttpClient) { }

  //private baseURL:string = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  headers = new HttpHeaders({
    'access-token':localStorage.getItem("jwtToken")
  });

  requestOptions = {                                                                                                                                                                                 
    headers: this.headers 
  };

  doChgPassword(data:any){
    return this.http.post<any>(this.baseURL+"/changepwd",data,this.requestOptions).pipe(map(result =>{
      return result;
    }));
  }
}
