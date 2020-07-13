import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { VerifyOTPComponent } from '../verify-otp/verify-otp.component';
import { ForgotPasswordService } from './forgot-password.service';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPwdForm:FormGroup
  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
  msg:string;
  
  constructor(public activeModal: NgbActiveModal,private formBuilder:FormBuilder,private fgPwdService: NgbModal,
    private forgotpwdService:ForgotPasswordService,private matDialog: MatDialog,private router:Router) {
    this.forgotPwdForm = this.formBuilder.group({
      resetEmail : new FormControl(null, [Validators.required, Validators.pattern(this.emailRegx)]),
    });
   }

  ngOnInit(): void {
  }

  public closeModal() {
    this.activeModal.close();
  }

  public resetEmailSubmit(): void{
    var data = {"email":this.forgotPwdForm.value['resetEmail']};
    localStorage.setItem("resetEmail",this.forgotPwdForm.value['resetEmail']);
    this.forgotpwdService.forgotPwdFormSubmission(data).subscribe(res=>{
      this.activeModal.close();
      this.fgPwdService.open(VerifyOTPComponent);
    },error=>{
      if(error.status==404){
        this.msg = "User Account doesn't exists, please register";
        this.matDialog.open(DialogBodyComponent,{
          data:{message:this.msg,name:"Forgot password - Failed"}
        });
        this.activeModal.close();
        this.router.navigateByUrl("/signup");
      }
      else if(error.status == 409){
        this.msg = "OTP already Generated and sent to your registered email id. Otherwise, Please wait for 2 minutes and try again";
        this.matDialog.open(DialogBodyComponent,{
          data:{message:this.msg,name:"Forgot password - OTP Error"}
        });
        this.activeModal.close();
      }
      else{
        this.msg = "Some problem in reseting your password.";
        this.matDialog.open(DialogBodyComponent,{
          data:{message:this.msg,name:"Forgot password - Contact Admin"}
        });
        this.activeModal.close();
      }
    });
  }
}
