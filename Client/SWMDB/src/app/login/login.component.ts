import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import {Router} from "@angular/router"
import { LoginService } from './login.service';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide: boolean;
  msg:string;
  region:string;
  loggedIn:string;
  role:string;
  userName:string;
  token:string;
  

  @ViewChild("pwd") passwordField:ElementRef;
  @ViewChild("lo") emailField:ElementRef;
  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
  constructor(private formBuilder:FormBuilder,private router: Router,private loginService:LoginService,private matDialog: MatDialog) {
    this.loginForm = this.formBuilder.group({
      loginEmail : new FormControl(null, [Validators.required, Validators.pattern(this.emailRegx)]),
      password : new FormControl(null, [Validators.required])
    });
    this.hide=true;
    this.region = " ";
    this.loggedIn = "No";
    this.role = " ";
    this.userName = " ";
    this.token = " ";
  }

  ngOnInit(): void {
  }

  public reset():void{
    this.loginForm.reset();
  }

  public loginUser():void{
    this.loginService.doLogin(this.loginForm.value).subscribe(res =>{
     
      this.region = res['userData']['countryCode'];
      this.role = res['userData']['role'];
      this.userName = res['userData']['username'];
      this.token = res['userData']['token'];
      this.loggedIn = "Yes";
      console.log("Inside loginuser method");

      //Setting the above values in local storage for further access
      localStorage.setItem("region",this.region);
      localStorage.setItem("role",this.role);
      localStorage.setItem("username",this.userName);
      localStorage.setItem("token",this.token);
      localStorage.setItem("isLoggedIn",this.loggedIn);
      sessionStorage.setItem("temp",this.loggedIn);
      sessionStorage.setItem("username",this.userName);

      this.loginService.broadcastLoginChange(this.userName);
      this.router.navigate(["/"]);
      
    },error =>{
      if(error.status == 401){
        this.msg = "Email ID or password is wrong, Please check and try again";
        localStorage.setItem("isLoggedIn",this.loggedIn);
        this.emailField.nativeElement.focus();
        this.matDialog.open(DialogBodyComponent,{
          data:{message:this.msg,name:"Login - Failed"}
        });
        
      }
      else if(error.status == 404){
        
        localStorage.setItem("isLoggedIn",this.loggedIn);
        console.log(localStorage.getItem("isLoggedIn"));
        this.msg = "User Account doesn't exists, please register and login";
        this.matDialog.open(DialogBodyComponent,{
          data:{message:this.msg,name:"Login - Failed"}
        });
        this.reset();
      }
      else{
        this.msg = "Some error occurred!. Please contact admin";
        localStorage.setItem("isLoggedIn",this.loggedIn);
        this.matDialog.open(DialogBodyComponent,{
          data:{message:this.msg,name:"Login - Failed"}
        });
        this.reset();
      }
    });
  }

  
}

