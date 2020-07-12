import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { MatDialog } from '@angular/material/dialog';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';
import { ChangePasswordService } from './change-password.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  chgPwdForm:FormGroup;
  msg:string = " ";
  hide: boolean;
  hide2: boolean;

  @ViewChild("pwd") passwordField:ElementRef;

  constructor(private formBuilder:FormBuilder,private matDialog: MatDialog,private loginService:LoginService,private router:Router,
    private chgPwdService:ChangePasswordService,private confirmationDialogService: ConfirmationDialogService) { 
    let passwordNew = new FormControl('', [Validators.required,Validators.minLength(6)]);
    let confirmPasswordNew= new FormControl('',CustomValidators.equalTo(passwordNew));
    
    this.chgPwdForm = this.formBuilder.group({
      password:passwordNew,
      confirmPassword:confirmPasswordNew
    });
    this.hide=true;
    this.hide2=true;
  }

  ngOnInit(): void {
  }

  chgPwdReset(){
    this.chgPwdForm.reset();
  }

  public changePwd():void{
    var data = {"email":localStorage.getItem("userEmailId"),"password":this.chgPwdForm.value['password']};
    this.confirmationDialogService.confirm("Request a Movie-Confirmation",'Are you sure to change your password?').then((confirmed)=>{
      if(confirmed){
        this.chgPwdService.doChgPassword(data).subscribe(result=>{
          this.msg= "Your password has been changed successfully. Please log in with new password."
          this.matDialog.open(DialogBodyComponent,{
            data:{message:this.msg,name:"Change Password - Success"}
          });
          this.loginService.logout();
        },error=>{
          if(error.status == 409){
            this.msg = "Your new and old password are the same.";
            this.matDialog.open(DialogBodyComponent,{
                data:{message:this.msg,name:"Change password - Failed"}
            });
            this.chgPwdReset();
          }
        });
      }
    });
  }
}