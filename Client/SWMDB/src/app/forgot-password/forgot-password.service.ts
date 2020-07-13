import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {

  constructor(private http: HttpClient) { }

  //private baseURL:string = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  forgotPwdFormSubmission(data:any){
    return this.http.post<any>(this.baseURL+"/forgotpwd",data).pipe(map(result=>{
      return result;
    }));
  }
}
