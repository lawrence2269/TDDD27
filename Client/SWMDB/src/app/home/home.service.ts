import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';

const localUrl = 'http://127.0.0.1:5000';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  getPopularMovies(data:any): Observable<any>{
    return this.http.get(localUrl+"/popularmovies",data);
  }
}
