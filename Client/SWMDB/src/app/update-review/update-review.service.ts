import { Injectable } from '@angular/core';
import { HttpClient,HttpParams, HttpHeaders} from '@angular/common/http';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UpdateReviewService {

  constructor(private http: HttpClient) { }

  //private baseURL:string = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  headers = new HttpHeaders({
    'access-token':localStorage.getItem("jwtToken")
  });

  requestOptions = {                                                                                                                                                                                 
    headers: this.headers 
  };

  getReviewById(data:any){
    let params = new HttpParams({fromString:'reviewId='+data});
    return this.http.get(this.baseURL+"/getreviewsbyid",{params}).pipe(map(result=>{
      return result;
    }));
  }

  doUpdateReviews(data:any){
    return this.http.post<any>(this.baseURL+"/updatereview",data,this.requestOptions).pipe(map(result=>{
      return result;
    }));
  }
}
