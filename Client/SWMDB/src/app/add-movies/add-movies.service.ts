import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AddMoviesService {

  constructor(private http: HttpClient) { }

  //private baseURL:string = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';

  fetchMovieRequestData(){
    return this.http.get(this.baseURL+"/admin/requestedmov").pipe(map(result=>{
      return result;
    }));
  }

  addRequestedMovies(data:any){
    return this.http.post<any>(this.baseURL+"/admin/addmovies",data).pipe(map(result=>{
      return result;
    }));
  }
}
