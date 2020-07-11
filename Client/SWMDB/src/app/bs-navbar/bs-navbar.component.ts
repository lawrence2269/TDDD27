import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'bs-navbar',
  templateUrl: './bs-navbar.component.html',
  styleUrls: ['./bs-navbar.component.css']
})
export class BsNavbarComponent implements OnInit {
  
  role:string;
  uname:string
  constructor(private loginService:LoginService) { 
    this.role = '';
    this.uname = '';
  }

  loginStatus$:Observable<boolean>;
  userName$:Observable<string>;
  userRole$:Observable<string>;

  ngOnInit(): void {
    this.loginStatus$ = this.loginService.isLoggedIn;
    this.userName$ = this.loginService.currentUserName;
    this.userRole$ = this.loginService.currentUserRole;
    this.loginService.currentUserRole.subscribe(urole=>{
      this.role = urole;
    });
    this.loginService.currentUserName.subscribe(name=>{
      this.uname = name;
    });
  }

  onLogout(){
    this.loginService.logout();
  }
}
