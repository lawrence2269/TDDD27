import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';

//const localUrl = 'http://127.0.0.1:3000';

const localUrl = 'https://swmdbapi.herokuapp.com';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  constructor(private http: HttpClient) { }

  getGenre():Observable<any>{
    return this.http.get(localUrl+"/genre");
  }

  getYears():Observable<any>{
    return this.http.get(localUrl+"/years");
  }

  getRatings():Observable<any>{
    return this.http.get(localUrl+"/ratings");
  }

  getAllMovies():Observable<any>{
    return this.http.get(localUrl+"/movies");
  }
}
