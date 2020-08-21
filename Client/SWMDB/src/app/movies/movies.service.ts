import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  constructor(private http: HttpClient) { }

  //private baseURL:string = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  getGenre():Observable<any>{
    return this.http.get(this.baseURL+"/genre");
  }

  getYears():Observable<any>{
    return this.http.get(this.baseURL+"/years");
  }

  getRatings():Observable<any>{
    return this.http.get(this.baseURL+"/ratings");
  }

  getAllMovies():Observable<any>{
    return this.http.get(this.baseURL+"/movies");
  }
}
