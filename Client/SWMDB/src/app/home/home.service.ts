import { Injectable } from '@angular/core';
import { HttpClient,HttpParams} from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  //private baseURL:string = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  getPopularMovies(data:any): Observable<any>{
    let params = new HttpParams({fromString:'region='+data});
    return this.http.get(this.baseURL+"/popularmovies",{params});
  }

  getPlayingMovies(data:any): Observable<any>{
    let params = new HttpParams({fromString:'region='+data});
    return this.http.get(this.baseURL+"/newmovies",{params});
  }

  getUpcomingMovies(data:any): Observable<any>{
    let params = new HttpParams({fromString:'region='+data});
    return this.http.get(this.baseURL+"/upcomingmovies",{params});
  }
}
