import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { VerifyOTPService } from './verify-otp.service';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOTPComponent implements OnInit {

  verifyOtpForm:FormGroup;
  msg:string = "";
  @ViewChild("otp") otpField:ElementRef;
  constructor(public verifyOTPmodal: NgbActiveModal,private formBuilder:FormBuilder,public verifyOTPService:VerifyOTPService,
    private matDialog: MatDialog,private vOtpModalService: NgbModal) { 
    this.verifyOtpForm = this.formBuilder.group({
      otpNumber : new FormControl(null, [Validators.required, Validators.pattern("[0-9]{6}")]),
    });
  }

  ngOnInit(): void {
  }

  public closeModal() {
    this.verifyOTPmodal.close();
  }

  public checkOTPNumber():void{
    var data = {"resetEmail":localStorage.getItem("resetEmail"),"otp":this.verifyOtpForm.value['otpNumber']};
    this.verifyOTPService.doVerifyOTP(data).subscribe(res=>{
      this.verifyOTPmodal.close();
      this.vOtpModalService.open(ResetPasswordComponent);
    },error=>{
      if(error.status == 409){
        this.msg = "OTP doesn't match or expired OTP, please check. Otherwise, request for reset password once again.";
        this.matDialog.open(DialogBodyComponent,{
          data:{message:this.msg,name:"Forgot password - OTP Error"}
        });
        this.verifyOtpForm.reset();
        this.otpField.nativeElement.focus();
      }
    });
  }
}