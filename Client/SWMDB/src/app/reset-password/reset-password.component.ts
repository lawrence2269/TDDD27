import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResetPasswordService } from './reset-password.service';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPwdForm:FormGroup;
  password_hide:boolean;
  confirmPwd_hide:boolean;
  msg:string = "";
  passwordRegx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  constructor(public verifyOTPmodal: NgbActiveModal,private formBuilder:FormBuilder,private resetPwdService:ResetPasswordService,
    private matDialog: MatDialog,private resetPwdModalService: NgbModal) { 
      let passwordValidator = new FormControl('', [Validators.required,Validators.minLength(6),Validators.pattern(this.passwordRegx)]);
      let confirmPwdValidator = new FormControl('',CustomValidators.equalTo(passwordValidator));
      this.resetPwdForm = this.formBuilder.group({
        password:passwordValidator,
        confirmPassword:confirmPwdValidator
      });
      this.password_hide = true;
      this.confirmPwd_hide = true;
    }

  ngOnInit(): void {
  }

  public reset():void{
    this.resetPwdForm.reset();
  }

  public resetPassword():void{
    var data = {"email":localStorage.getItem("resetEmail"),"password":this.resetPwdForm.value['password'],"confirm_password":this.resetPwdForm.value['confirmPassword']};
    this.resetPwdService.doResetPwd(data).subscribe(result=>{
      localStorage.removeItem("resetEmail");
      this.verifyOTPmodal.close();
      this.msg = "Password reset successful, please use new password to login";
        this.matDialog.open(DialogBodyComponent,{
          data:{message:this.msg,name:"Reset password - Success"}
        });
    },error=>{
      this.msg = "Some problem in reseting your password.";
      this.matDialog.open(DialogBodyComponent,{
        data:{message:this.msg,name:"Reset password - Contact Admin"}
      });
      this.verifyOTPmodal.close();
    });
  }
}