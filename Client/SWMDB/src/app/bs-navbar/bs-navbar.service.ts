import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BsNavbarService {

  constructor(private http: HttpClient) { }

  //const localUrl = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  headers = new HttpHeaders({
    'access-token':localStorage.getItem("jwtToken")
  });

  requestOptions = {                                                                                                                                                                                 
    headers: this.headers 
  };

  doDeactivate(data:any){
    return this.http.post<any>(this.baseURL+"/deactivateacct",data,this.requestOptions).pipe(map(result=>{
      return result;
    }));
  }
}
