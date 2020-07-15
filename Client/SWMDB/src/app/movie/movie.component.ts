import { MovieService } from './movie.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';  
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { LoginService } from '../login/login.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MoviesService } from '../movies/movies.service';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {
  title:string = "";
  year:number = 0;
  genre:string = "";
  adult_Content:string = "";
  poster_path:string = "";
  runTime:string = "";
  synopsis:string = "";
  trailer:SafeResourceUrl;
  tmdb_id:number = 0;
  imdb_id:string = "";
  rating:number = 0;
  like_count:number = 0;
  yify_id:number = 0;
  similar_Movies_Poster_Path:any = [];
  similar_Movies_Title:any = [];
  similar_Movies_Year:any = [];
  trailerString:string= "";
  mySubscription: any;
  runTimeServer:any;
  castNames:any = [];
  castImageURL:any = [];
  characterNames:any = [];
  castProfileURL:any = [];
  directorNames:any = [];
  directorImageURL:any = [];
  directorProfileURL:any = [];
  reviewsList:any = [];
  starRating:number;
  ratingsList:any = [];
  author:string;
  uid:string;
  reviewForm: FormGroup;
  loginStatus:boolean;
  
  @ViewChild('autosize') 
  txtAreaAutosize: CdkTextareaAutosize;

  constructor(private route: ActivatedRoute,private router: Router,private movieService: MovieService,
    private sanitizer: DomSanitizer,private matDialog: MatDialog,public datepipe: DatePipe,private loginService:LoginService,
    private formBuilder:FormBuilder,private moviesService:MoviesService) { 

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

    this.moviesService.getRatings().subscribe((data)=>{
      data.ratings.forEach(elements=>{
        this.ratingsList.push(elements);
      });
    });

    this.reviewForm = this.formBuilder.group({
      username:new FormControl(localStorage.getItem("username")),
      review:new FormControl(null, Validators.required),
      likes:new FormControl(null,Validators.required),
      rating:new FormControl(null,Validators.required)
    });

    this.route.queryParams.subscribe(params=>{
      this.title = params['title'];
      this.year = params['year'];
    });
    this.author = localStorage.getItem("username");
  }

  //loginStatus$:Observable<boolean>;
  //userName$:Observable<string>;

  ngOnInit(): void {
    let temp:number = 0;
    this.loginService.isLoggedIn.subscribe(status=>{
      this.loginStatus = status;
    });
    this.movieService.getMovieDetails(this.title,this.year).subscribe((data)=>{
        this.genre = data.movieDetails[0]['genre'];
        this.adult_Content = data.movieDetails[0]['adult_Content'];
        this.poster_path = data.movieDetails[0]['poster_path'];
        this.runTime = this.runTimeConversion(data.movieDetails[0]['runtime']);
        this.synopsis = data.movieDetails[0]['synopsis'];
        this.trailer = this.sanitizer.bypassSecurityTrustResourceUrl(data.movieDetails[0]['trailer']);
        this.trailerString = data.movieDetails[0]['trailer'];
        this.tmdb_id = data.movieDetails[0]['tmdb_id'];
        this.imdb_id = data.movieDetails[0]['imdb_id'];
        this.rating = data.movieDetails[0]['rating'];
        this.like_count = data.movieDetails[0]['likes'];
        this.yify_id = data.movieDetails[0]['yify_id'];
        this.runTimeServer = data.movieDetails[0]['runtime']
        
        data.movieDetails[0]['cast'].forEach(elements=>{
          this.castNames.push(elements.name);
          this.characterNames.push(elements.character_name);
          this.castProfileURL.push(elements.imdb_profile_url);
          this.castImageURL.push(elements.cast_image_url)
        });
        data.movieDetails[0]['directors'].forEach(elements=>{
          this.directorNames.push(elements.name);
          this.directorImageURL.push(elements.cast_image_url);
          this.directorProfileURL.push(elements.imdb_profile_url);
        });
        
        this.movieService.getSimilarMovies(data.movieDetails[0]['tmdb_id']).subscribe((data)=>{
          data.similarMovies.forEach(elements=>{
            this.similar_Movies_Poster_Path.push(elements.poster_path);
            this.similar_Movies_Title.push(elements.title);
            this.similar_Movies_Year.push(elements.year);
          });
        this.movieService.getReviews(this.title).subscribe((data)=>{
          data.reviews.forEach(elements=>{
            this.reviewsList.push(elements);
          });
        });
      });
    });
  }

  public runTimeConversion(value:number):string{
    let hours = (value/60);
    let rhours = Math.floor(hours);
    let minutes = (hours-rhours)*60;
    let rminutes = Math.round(minutes);
    return rhours+" hour(s) and "+rminutes+" minute(s)";
  }

  public similarMovieClick(value1:string,value2:number):void{
    this.router.navigateByUrl('/movie',{skipLocationChange:true}).then(()=>{
      this.router.navigate(['/movie'],{queryParams:{title:value1,year:value2}});
    });
  }

  public deleteReview(id:any):void{
    console.log(id);
  }

  public trackByRating(i:number,review:any){
    this.starRating = review.rating;
    return this.starRating;
  }

  public setUid(review:any){
    this.uid = review.author;
    return this.uid;
  }

  public submitReview(){
    console.log(this.reviewForm.value);
  }

  public doReset():void{
    this.reviewForm.reset({email:this.reviewForm.get("email").value});
  }

  public formatLabel(value: number) {
    return value;
  }
}
