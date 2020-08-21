import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  constructor(private http: HttpClient) { 

  }

  //private baseURL:string = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  getCountriesList(){
    return this.http.get(this.baseURL+"/countries");
  }

  createUser(data:any): Observable<any>{
    return this.http.post<any>(this.baseURL+"/createuser",data);
  }
}
