import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovieRequestService {

  constructor(private http: HttpClient) { }

  //const localUrl = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  headers = new HttpHeaders({
    //'Access-Control-Allow-Origin':'*',
    'access-token':localStorage.getItem("jwtToken")
  });

  requestOptions = {                                                                                                                                                                                 
    headers: this.headers 
  };

  getLanguagesList(){
    return this.http.get(this.baseURL+"/languages");
  }

  getReleaseYearList(){
    return this.http.get(this.baseURL+"/years");
  }

  doRequestMovie(data:any){
    return this.http.post<any>(this.baseURL+"/requestmovie",data,this.requestOptions).pipe(map(result=>{
      return result;
    }));
  }
}
