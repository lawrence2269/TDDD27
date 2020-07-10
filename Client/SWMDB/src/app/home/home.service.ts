import { Injectable } from '@angular/core';
import { HttpClient,HttpParams} from '@angular/common/http';
import { Observable} from 'rxjs';

//const localUrl = 'http://127.0.0.1:3000';
const localUrl = 'https://swmdbapi.herokuapp.com';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  getPopularMovies(data:any): Observable<any>{
    let params = new HttpParams({fromString:'region='+data});
    return this.http.get(localUrl+"/popularmovies",{params});
  }

  getPlayingMovies(data:any): Observable<any>{
    let params = new HttpParams({fromString:'region='+data});
    return this.http.get(localUrl+"/newmovies",{params});
  }

  getUpcomingMovies(data:any): Observable<any>{
    let params = new HttpParams({fromString:'region='+data});
    return this.http.get(localUrl+"/upcomingmovies",{params});
  }
}
