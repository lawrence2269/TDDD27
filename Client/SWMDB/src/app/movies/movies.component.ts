import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MoviesService } from './movies.service';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit {
  movieYears:any = [];
  genreList:any = [];
  ratingsList:any = [];
  status:string = "No";
  moviesForm:FormGroup;
  color = 'primary';
  constructor(private formBuilder:FormBuilder,private route: ActivatedRoute,private router: Router,private moviesService: MoviesService) { 
    this.moviesService.getGenre().subscribe((data)=>{
      data.genres.forEach(elements=>{
        this.genreList.push(elements);
      });
    });
    this.moviesService.getYears().subscribe((data)=>{
      data.years.forEach(elements=>{
        this.movieYears.push(elements);
      });
    });

    this.moviesService.getRatings().subscribe((data)=>{
      data.ratings.forEach(elements=>{
        this.ratingsList.push(elements);
      });
    });

    this.moviesForm = this.formBuilder.group({
      years : new FormControl(this.movieYears),
      genre : new FormControl(this.genreList),
      ratings : new FormControl(this.ratingsList)
    });
    console.log("year array length is "+this.movieYears.length);
  }

  ngOnInit(): void {
    
  }

  onAdultContent(value){
    this.status = value? "Yes":"No";
  }
}
