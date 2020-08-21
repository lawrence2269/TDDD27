import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject} from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { SocialAuthService } from 'angularx-social-login';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient,private router : Router,private authService: SocialAuthService) { }

  //private baseURL:string = 'http://127.0.0.1:3000';
  private baseURL:string = 'https://swmdbapi.herokuapp.com';


  private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus());
  private UserName    = new BehaviorSubject<string>(localStorage.getItem('username'));
  private UserRole    = new BehaviorSubject<string>(localStorage.getItem('userRole'));
  private loginMethod = new BehaviorSubject<string>(localStorage.getItem("loginMethod"));

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
        localStorage.setItem("loginMethod","normal");

        this.UserName.next(localStorage.getItem("username"));
        this.UserRole.next(localStorage.getItem("userRole"));
        this.loginMethod.next(localStorage.getItem("loginMethod"));
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
    if(localStorage.getItem("loginMethod")=='social'){
      this.authService.signOut();
    }
    localStorage.removeItem("loginMethod");
    this.router.navigate(['/']);
  }

  doSocialLogin(data:any){
    return this.http.post<any>(this.baseURL+"/sociallogin",data).pipe(map(result=>{
      if(result['userData']['token'].length!=null||result['userData']['token'].length!=undefined||
      result['userData']['token'].length!=' '||result['userData']['message']=="Success"){

        this.loginStatus.next(true);
        localStorage.setItem("loginStatus",'1');
        localStorage.setItem("userEmailId",result['userData']['email']);
        localStorage.setItem("jwtToken",result['userData']['token']);
        localStorage.setItem("username",result['userData']['username']);
        localStorage.setItem("userRole",result['userData']['role']);
        localStorage.setItem("region",result['userData']['countryCode']);
        localStorage.setItem("loginMethod","social");

        this.UserName.next(localStorage.getItem("username"));
        this.UserRole.next(localStorage.getItem("userRole"));
        this.loginMethod.next(localStorage.getItem("loginMethod"));
      }
      return result;
    }));
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

  get LoginMethod(){
    return this.loginMethod.asObservable();
  }
}
