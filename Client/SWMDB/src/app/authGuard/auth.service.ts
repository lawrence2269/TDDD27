import { Injectable } from '@angular/core';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loginStatus:boolean;

  constructor(private loginService:LoginService) { 

  }

  public isAuthenticated(){
    this.loginService.isLoggedIn.subscribe(status=>{
      this.loginStatus = status;
    });

    if(this.loginStatus){
      return true;
    }
    else{
      return false;
    }
  }
}
