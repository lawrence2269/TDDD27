import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable, Subject} from 'rxjs';

//const localUrl = 'http://127.0.0.1:3000';
const localUrl = 'https://swmdbapi.herokuapp.com';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  uname:Subject<string> = new Subject();

  doLogin(data:any):Observable<any>{
    return this.http.post<any>(localUrl+"/login",data);
  }

   broadcastLoginChange(text:string) {
    this.uname.next(text);
  }
}
