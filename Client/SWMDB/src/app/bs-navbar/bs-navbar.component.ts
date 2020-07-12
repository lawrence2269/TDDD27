import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';
import { Observable } from 'rxjs';
import { BsNavbarService } from './bs-navbar.service';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'bs-navbar',
  templateUrl: './bs-navbar.component.html',
  styleUrls: ['./bs-navbar.component.css']
})
export class BsNavbarComponent implements OnInit {
  
  role:string;
  uname:string
  msg:string;
  constructor(private loginService:LoginService,private bsNavbarService:BsNavbarService,private matDialog: MatDialog,
    private router: Router,private confirmationDialogService: ConfirmationDialogService) { 
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

  onDeactivateAcct(){
    this.confirmationDialogService.confirm("Deactivation-Confirmation",'Are you sure to deactivate your account?').then((confirmed)=>{
      if(confirmed){
          var data = {"email":localStorage.getItem("userEmailId")};
          this.bsNavbarService.doDeactivate(data).subscribe(result=>{
            this.msg = result['message']+". If you want to activate your account, please log in.";
            this.matDialog.open(DialogBodyComponent,{
              data:{message:this.msg,name:"Deactivation - Successful"}
            });
          this.loginService.logout();
          this.router.navigateByUrl("/");
        },error=>{
          this.msg = "Some problem in deactivating your account please try again";
          this.matDialog.open(DialogBodyComponent,{
            data:{message:this.msg,name:"Deactivation - Failed"}
          });
          this.router.navigateByUrl("/");
        });
      }
    }).catch(()=>{
      
    })
  }
}
