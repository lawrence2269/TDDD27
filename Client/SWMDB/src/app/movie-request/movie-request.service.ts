import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//const localUrl = 'http://127.0.0.1:3000';
const localUrl = 'https://swmdbapi.herokuapp.com';

@Injectable({
  providedIn: 'root'
})
export class MovieRequestService {

  constructor(private http: HttpClient) { }

  getLanguagesList(){
    return this.http.get(localUrl+"/languages");
  }

  getReleaseYearList(){
    return this.http.get(localUrl+"/years");
  }
}
