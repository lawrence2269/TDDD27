import { Injectable } from '@angular/core';
import { HttpClient,HttpParams, HttpHeaders} from '@angular/common/http';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  constructor(private http: HttpClient) { }

  //private baseURL:string = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  headers = new HttpHeaders({
    'access-token':localStorage.getItem("jwtToken")
  });

  requestOptions = {                                                                                                                                                                                 
    headers: this.headers 
  };

  getMovieDetails(title:string,year:number):Observable<any>{
    let params = new HttpParams({fromString:'title='+title+"&year="+year});
    return this.http.get(this.baseURL+"/movieDetails",{params});
  }

  getSimilarMovies(value:number):Observable<any>{
    let params = new HttpParams({fromString:'tmdb_id='+value});
    return this.http.get(this.baseURL+"/similarmovies",{params});
  }

  getReviews(value:string):Observable<any>{
    let params = new HttpParams({fromString:'title='+value});
    return this.http.get(this.baseURL+"/userreviews",{params});
  }

  createReviews(data:any){
    return this.http.post<any>(this.baseURL+"/createreview",data,this.requestOptions).pipe(map(result=>{
      return result;
    }));
  }

  deleteReview(data:any){
    return this.http.post<any>(this.baseURL+"/deletereview",data,this.requestOptions).pipe(map(result=>{
      return result;
    }));
  }
}
