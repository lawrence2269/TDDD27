import { MovieService } from './movie.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';  
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {
  title:String = "";
  year:number = 0;
  genre:String = "";
  adult_Content:String = "";
  poster_path:String = "";
  runTime:String = "";
  synopsis:String = "";
  trailer:SafeResourceUrl;
  tmdb_id:number = 0;
  imdb_id:String = "";
  rating:number = 0;
  like_count:number = 0;
  yify_id:number = 0;
  similar_Movies_Poster_Path:any = [];
  similar_Movies_Title:any = [];
  similar_Movies_Year:any = [];
  trailerString:String= "";
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

  constructor(private route: ActivatedRoute,private router: Router,private movieService: MovieService,
    private sanitizer: DomSanitizer,private matDialog: MatDialog,public datepipe: DatePipe) { 

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

    this.route.queryParams.subscribe(params=>{
      this.title = params['title'];
      this.year = params['year'];
    });
  }

  ngOnInit(): void {
    let temp:number = 0;
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

  public runTimeConversion(value:number):String{
    let hours = (value/60);
    let rhours = Math.floor(hours);
    let minutes = (hours-rhours)*60;
    let rminutes = Math.round(minutes);
    return rhours+" hour(s) and "+rminutes+" minute(s)";
  }

  public similarMovieClick(value1:String,value2:number):void{
    this.router.navigateByUrl('/movie',{skipLocationChange:true}).then(()=>{
      this.router.navigate(['/movie'],{queryParams:{title:value1,year:value2}});
    });
  }

  public deleteReview(value1:String,value2:String):void{
    console.log(value1+"\t"+value2);
  }

  public trackByRating(i:number,review:any){
    this.starRating = review.rating;
    return this.starRating;
  }
}
