import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MovieRequestService } from './movie-request.service';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import { SignupService } from '../signup/signup.service';

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
  constructor(private formBuilder:FormBuilder,private matDialog: MatDialog,private requestMovieService:MovieRequestService,
    private signUpService:SignupService) { 
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

  public reset():void{
    this.requestMovieForm.reset();
  }

  public requestMovie():void{
    console.log("Requested movie is: "+JSON.stringify(this.requestMovieForm.value));
    this.reset();
  }

}
