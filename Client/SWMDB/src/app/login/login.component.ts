import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomValidators } from 'ng2-validation';
import {Router} from "@angular/router"
import { LoginService } from './login.service';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide: boolean;
  msg:string;
  invalidLogin: boolean;
  

  @ViewChild("pwd") passwordField:ElementRef;
  @ViewChild("logemail") emailField:ElementRef;
  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
  constructor(private formBuilder:FormBuilder,private router: Router,private loginService:LoginService,private matDialog: MatDialog,
    private modalService: NgbModal) {
    this.loginForm = this.formBuilder.group({
      loginEmail : new FormControl(null, [Validators.required, Validators.pattern(this.emailRegx)]),
      password : new FormControl(null, [Validators.required])
    });
    this.hide=true;
  }

  ngOnInit(): void {
  }

  public openFormModal(){
    this.modalService.open(ForgotPasswordComponent);
  }

  public reset():void{
    this.loginForm.reset();
  }

  public loginUser():void{
      this.loginService.doLogin(this.loginForm.value).subscribe(result =>{
            this.invalidLogin = false;
            this.router.navigateByUrl("/");
      },error =>{
            if(error.status == 401){
              this.invalidLogin = true;
              this.msg = "Email ID or password is wrong, Please check and try again";
              this.emailField.nativeElement.focus();
              this.passwordField.nativeElement.value = "";
              this.matDialog.open(DialogBodyComponent,{
                data:{message:this.msg,name:"Login - Failed"}
              });
            }
            else if(error.status == 404){
              this.invalidLogin = true;
              this.msg = "User Account doesn't exists, please register and login";
              this.matDialog.open(DialogBodyComponent,{
                data:{message:this.msg,name:"Login - Failed"}
              });
              this.reset();
            }
            else{
              this.invalidLogin = true;
              this.msg = "Some error occurred!. Please contact admin";
              this.matDialog.open(DialogBodyComponent,{
                data:{message:this.msg,name:"Login - Failed"}
              });
              this.reset();
            }
       });
    }
}

