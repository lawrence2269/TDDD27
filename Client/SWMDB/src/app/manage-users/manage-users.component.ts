import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { ManageUsersService } from './manage-users.service';
import { promise } from 'protractor';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})

export class ManageUsersComponent implements OnInit {
  msg:string = " ";
  uData:any = [];
  mySubscription:any;

  constructor(private matDialog: MatDialog,private router: Router,private confirmationDialogService: ConfirmationDialogService,
    private manageUsrSrv:ManageUsersService,private route: ActivatedRoute) { 
      
      this.router.events.subscribe((e)=>{
        if(e instanceof NavigationEnd){
          window.scrollTo(0,0);
        }
      });
      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      };
      this.mySubscription = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          // Trick the Router into believing it's last link wasn't previously loaded
          this.router.navigated = false;
        }
      });
  
      this.fetchUserData();
  }

  ngOnInit():void {
  
  }

  ngOnDestroy() {
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }

  public fetchUserData(){
    return this.manageUsrSrv.fetchUsers().subscribe((data)=>{
        data['users'].forEach(elements=>{
          this.uData.push(elements);
        });
    });
  }

  public deleteUser(emailid:String):void{
    this.confirmationDialogService.confirm("Delete a user - confirmation",'Are you sure to delete this user?').then((confirmed)=>{
      if(confirmed){
        var data = {"email":emailid};
        this.manageUsrSrv.deleteUsers(data).subscribe(res=>{
          this.msg= "User deleted successfully.";
          this.matDialog.open(DialogBodyComponent,{
            data:{message:this.msg,name:"Delete a user - Success"}
          });
          this.router.navigateByUrl("/manageusr");
        },error =>{
          if(error.status == 400 || error.status == 500){
            this.msg = "Some problem in deleting the user.";
            this.matDialog.open(DialogBodyComponent,{
                data:{message:this.msg,name:"Delete a user - Failed"}
            });
            this.router.navigateByUrl("/manageusr");
          }
        })
      }
    });
  }
}
