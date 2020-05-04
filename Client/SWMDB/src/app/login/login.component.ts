import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import {Router} from "@angular/router"

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
  constructor(private formBuilder:FormBuilder,private router: Router) {
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
    this.router.navigate(["/"]);
  }
}