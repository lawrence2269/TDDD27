import { Injectable } from '@angular/core';
import { HttpClient,HttpParams} from '@angular/common/http';
import { Observable} from 'rxjs';

//const localUrl = 'http://127.0.0.1:3000';
const localUrl = 'https://swmdbapi.herokuapp.com';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  constructor(private http: HttpClient) { }

  getMovieDetails(title:string,year:number):Observable<any>{
    let params = new HttpParams({fromString:'title='+title+"&year="+year});
    return this.http.get(localUrl+"/movieDetails",{params});
  }

  getSimilarMovies(value:number):Observable<any>{
    let params = new HttpParams({fromString:'tmdb_id='+value});
    return this.http.get(localUrl+"/similarmovies",{params});
  }

  getReviews(value:string):Observable<any>{
    let params = new HttpParams({fromString:'title='+value});
    return this.http.get(localUrl+"/userreviews",{params});
  }
}
