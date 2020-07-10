import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'bs-navbar',
  templateUrl: './bs-navbar.component.html',
  styleUrls: ['./bs-navbar.component.css']
})
export class BsNavbarComponent implements OnInit {
  userName:String;
  role:String;
  loggedIn:boolean;

  constructor(private loginService:LoginService) { }

  ngOnInit(): void {
    localStorage.clear();
    //this.userName = localStorage.getItem("username");
    this.role = localStorage.getItem("role");
    console.log("SessionStorage data: "+sessionStorage.getItem("temp"));
    if(localStorage.getItem("isLoggedIn") == null || localStorage.getItem("isLoggedIn") == "No"){
      this.loggedIn = false;
    }
    else{
      this.loggedIn = true;
    }
    this.loginService.uname.subscribe((val) => {
      this.userName=val;
    });
    console.log("Logged in : "+sessionStorage.getItem("username"));
  }
}
