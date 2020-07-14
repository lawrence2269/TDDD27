import { Component, OnInit } from '@angular/core';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { AddMoviesService } from './add-movies.service';

@Component({
  selector: 'app-add-movies',
  templateUrl: './add-movies.component.html',
  styleUrls: ['./add-movies.component.css']
})
export class AddMoviesComponent implements OnInit {

  msg:string = " ";
  requestMovieData:any = [];
  mySubscription:any;

  constructor(private matDialog: MatDialog,private router: Router,private confirmationDialogService: ConfirmationDialogService,
    private route: ActivatedRoute, private addMovSrv:AddMoviesService) { 

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

      this.fetchMovieRequestData();
    }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }

  public fetchMovieRequestData(){
    return this.addMovSrv.fetchMovieRequestData().subscribe((data)=>{
        data['requestedMovies'].forEach(elements=>{
          this.requestMovieData.push(elements);
        });
    });
  }

  public addMovie(emailId:string,title:string,year:Number){
    this.confirmationDialogService.confirm("Add a requested movie - confirmation",'Are you sure to add this movie?').then((confirmed)=>{
      if(confirmed){
        var data = {"email":emailId,"title":title,"year":year};
        this.addMovSrv.addRequestedMovies(data).subscribe(res=>{
          this.msg= "Requested movie added successfully.";
          this.matDialog.open(DialogBodyComponent,{
            data:{message:this.msg,name:"Add a requested movie - Success"}
          });
          this.router.navigateByUrl("/addmovie");
        },error=>{
          if(error.status == 400 || error.status == 500){
            this.msg= "Some problem in adding the requested movie. Please contact the IT Team.";
            this.matDialog.open(DialogBodyComponent,{
              data:{message:this.msg,name:"Add a requested movie - Failure"}
            });
            this.router.navigateByUrl("/addmovie");
          }
          else{
            this.msg= "Movie details are not available, as it is yet to be released.";
            this.matDialog.open(DialogBodyComponent,{
              data:{message:this.msg,name:"Add a requested movie - Failure"}
            });
            this.router.navigateByUrl("/addmovie");
          }
        });
      } 
    });
  }
}
