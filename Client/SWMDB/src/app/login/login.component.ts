import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import {Router} from "@angular/router"
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide: boolean;
  @ViewChild("email") emailField:ElementRef;
  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
  constructor(private formBuilder:FormBuilder,private router: Router,private loginService:LoginService) {
    this.loginForm = this.formBuilder.group({
      loginEmail : new FormControl(null, [Validators.required, Validators.pattern(this.emailRegx)]),
      password : new FormControl(null, [Validators.required])
    });
    this.hide=true;
  }

  ngOnInit(): void {
  }

  public reset():void{
    this.loginForm.reset();
  }

  public loginUser():void{
    console.log(this.loginForm.value);
    let region = ""
    let isLoggedIn:string = "No";
    console.log("Inside loginUser() method")
    if(isLoggedIn == "No"){
        this.loginService.doLogin(this.loginForm.value).subscribe(res =>{
          console.log("Inside subscribe method")
          if(res['message'] == "Success"){
            console.log(res);
          }
          else if(res['message'] == "Password doesn't match"){
            console.log(res);
          }
          else
          {
            console.log(res);
          }
        })
        if(sessionStorage.getItem("region") == null)
        {
          sessionStorage.setItem("region","US");
          region = "US";
          console.log(localStorage.getItem("region"));
        }
        else
        {
          region = sessionStorage.getItem("region");
          console.log(sessionStorage.getItem("region"));
        }
        isLoggedIn = "Yes";
        sessionStorage.setItem("isLoggedIn",isLoggedIn);
        this.router.navigate(["/"]);
    }
    else
    {
      isLoggedIn = "No";
      sessionStorage.setItem("region","US");
      sessionStorage.setItem("isLoggedIn",isLoggedIn);
    }
  }
}