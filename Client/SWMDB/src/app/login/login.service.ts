import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject} from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient,private router : Router) { }

  //const localUrl = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';


  private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus());
  private UserName    = new BehaviorSubject<string>(localStorage.getItem('username'));
  private UserRole    = new BehaviorSubject<string>(localStorage.getItem('userRole'));

  doLogin(data:any){
    return this.http.post<any>(this.baseURL+"/login",data).pipe(map(result=>{
      if(result['userData']['token'].length!=null||result['userData']['token'].length!=undefined||
      result['userData']['token'].length!=' '||result['userData']['message']=="Success"){
        
        this.loginStatus.next(true);
        localStorage.setItem("loginStatus",'1');
        localStorage.setItem("userEmailId",data['loginEmail']);
        localStorage.setItem("jwtToken",result['userData']['token']);
        localStorage.setItem("username",result['userData']['username']);
        localStorage.setItem("userRole",result['userData']['role']);
        localStorage.setItem("region",result['userData']['countryCode']);

        this.UserName.next(localStorage.getItem("username"));
        this.UserRole.next(localStorage.getItem("userRole"));
        console.log("Inside login service: "+localStorage.getItem("userEmailId"));
      }
      return result;
    }));
  }

  logout(){
    this.loginStatus.next(false);
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("region");
    localStorage.setItem("loginStatus",'0');
    this.router.navigate(['/']);
  }

  checkLoginStatus():boolean{
    var loginCookie = localStorage.getItem("loginStatus");
    if(loginCookie == '1'){
      if(localStorage.getItem("jwtToken") === null || localStorage.getItem("jwtToken") === undefined || localStorage.getItem("jwtToken") == " "){
        return false;
      }
      else{
        return true;
      }
    }
  }

  get isLoggedIn(){
    return this.loginStatus.asObservable();
  }

  get currentUserName(){
    return this.UserName.asObservable();  
  }

  get currentUserRole(){
    return this.UserRole.asObservable();
  }
}
