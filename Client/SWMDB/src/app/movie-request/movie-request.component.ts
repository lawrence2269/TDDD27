import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MovieRequestService } from './movie-request.service';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import { SignupService } from '../signup/signup.service';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-movie-request',
  templateUrl: './movie-request.component.html',
  styleUrls: ['./movie-request.component.css']
})
export class MovieRequestComponent implements OnInit {
  requestMovieForm: FormGroup;
  msg:string = " ";
  release_year:any = [];
  countries:any = [];
  languages:any = [];
  resetValue:any = {};
  @ViewChild("titleField") titleField:ElementRef;
  @ViewChild("releaseYearField") releaseYearField:ElementRef;
  @ViewChild("languageField") languageField:ElementRef;
  @ViewChild("countryField") countryField:ElementRef;
  constructor(private formBuilder:FormBuilder,private matDialog: MatDialog,private requestMovieService:MovieRequestService,
    private signUpService:SignupService,private router: Router,private confirmationDialogService: ConfirmationDialogService) { 
    this.requestMovieForm = this.formBuilder.group({
      emailId: new FormControl(localStorage.getItem("userEmailId")),
      title : new FormControl(null,Validators.required),
      releaseYear:new FormControl(this.release_year,Validators.required),
      movieLanguage:new FormControl(this.languages,Validators.required),
      countryReleased:new FormControl(this.countries,Validators.required)
    })
  }

  ngOnInit(): void {
    this.signUpService.getCountriesList().subscribe((data)=>{
      this.countries = data['countries'];
      this.countries.sort();
    });

    this.requestMovieService.getLanguagesList().subscribe((data)=>{
      this.languages = data['languages'];
      this.languages.sort();
    })

    this.requestMovieService.getReleaseYearList().subscribe((data)=>{
      this.release_year = data['years'];
      this.release_year.reverse();
    });
  }

  public doReset():void{
    this.requestMovieForm.reset({emailId:this.requestMovieForm.get("emailId").value});
  }

  public requestMovie():void{
    this.confirmationDialogService.confirm("Request a Movie-Confirmation",'Are you sure to submit?').then((confirmed)=>{
      if(confirmed){
        this.requestMovieService.doRequestMovie(this.requestMovieForm.value).subscribe(data=>{
          this.msg= "Your request has been submitted successfully."
          this.matDialog.open(DialogBodyComponent,{
            data:{message:this.msg,name:"Request a movie - Success"}
          });
          this.doReset();
        },error=>{
          if(error.status == 409){
            this.msg = "This Movie already requested by another user. Please wait until we add them.";
            this.matDialog.open(DialogBodyComponent,{
                data:{message:this.msg,name:"Request a movie - Failed"}
            });
            this.doReset();
          }
        });
      }
    }).catch(()=>{

    });
  }
}
