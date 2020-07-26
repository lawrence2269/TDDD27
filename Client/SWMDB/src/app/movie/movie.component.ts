import { MovieService } from './movie.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';  
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { LoginService } from '../login/login.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MoviesService } from '../movies/movies.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';
import { UpdateReviewComponent } from '../update-review/update-review.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  dislike_count:number = 0;
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
  msg:string = "";
  swmdbRating:number = 0;

  constructor(private route: ActivatedRoute,private router: Router,private movieService: MovieService,
    private sanitizer: DomSanitizer,private matDialog: MatDialog,public datepipe: DatePipe,private loginService:LoginService,
    private formBuilder:FormBuilder,private moviesService:MoviesService,private confirmationDialogService: ConfirmationDialogService,
    private updateReviewModalService:NgbModal) { 

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

    let temp:number = 0;
    this.loginService.isLoggedIn.subscribe(status=>{
      this.loginStatus = status;
    });

    this.movieService.getMovieDetails(this.title,this.year).subscribe((data)=>{
      if(data['movieDetails'].length > 0)
      {
        this.genre = data['movieDetails'][0]['genre'];
        this.adult_Content = data['movieDetails'][0]['adult_Content'];
        this.poster_path = data['movieDetails'][0]['poster_path'];
        this.runTime = this.runTimeConversion(data['movieDetails'][0]['runtime']);
        this.synopsis = data['movieDetails'][0]['synopsis'];
        this.trailer = this.sanitizer.bypassSecurityTrustResourceUrl(data['movieDetails'][0]['trailer']);
        this.trailerString = data['movieDetails'][0]['trailer'];
        this.tmdb_id = data['movieDetails'][0]['tmdb_id'];
        this.imdb_id = data['movieDetails'][0]['imdb_id'];
        this.rating = data['movieDetails'][0]['rating'];
        this.like_count = data['movieDetails'][0]['likes'];
        this.dislike_count = data['movieDetails'][0]['dislikes'];
        this.swmdbRating = data['movieDetails'][0]['SWMDBRating'];
        
        this.yify_id = data['movieDetails'][0]['yify_id'];
        this.runTimeServer = data['movieDetails'][0]['runtime'];

        data['movieDetails'][0]['cast'].forEach(elements=>{
          this.castNames.push(elements.name);
          this.characterNames.push(elements.character_name);
          this.castProfileURL.push(elements.imdb_profile_url);
          this.castImageURL.push(elements.cast_image_url)
        });

        data['movieDetails'][0]['directors'].forEach(elements=>{
          this.directorNames.push(elements.name);
          this.directorImageURL.push(elements.cast_image_url);
          this.directorProfileURL.push(elements.imdb_profile_url);
        });

        this.movieService.getReviews(this.title).subscribe((data)=>{
          data.reviews.forEach(elements=>{
            this.reviewsList.push(elements);
          });
        });

        this.movieService.getSimilarMovies(data.movieDetails[0]['tmdb_id']).subscribe((data)=>{
          data.similarMovies.forEach(elements=>{
            this.similar_Movies_Poster_Path.push(elements.poster_path);
            this.similar_Movies_Title.push(elements.title);
            this.similar_Movies_Year.push(elements.release_year);
          });
        });
      }
      else{
        this.router.navigate(["/movienotfound"]);
      }
    });
  }

  ngOnInit(): void 
  {
    // this.movieService.getMovieDetails(this.title,this.year).subscribe((data)=>{
    //   if(data['movieDetails'].length ==  0){
    //     this.router.navigate(["/movienotfound"]);
    //   }
    // });
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
    this.confirmationDialogService.confirm("Delete eview",'Are you sure to delete?').then(confirmed=>{
      if(confirmed){
        var data = {"reviewId":id};
        this.movieService.deleteReview(data).subscribe(result=>{
          this.msg= "Your review has been deleted successfully.";
          this.matDialog.open(DialogBodyComponent,{
            data:{message:this.msg,name:"Delete review - Success"}
          });
          this.router.navigate(['/movie'],{queryParams:{title:this.title,year:this.year}});
        },error=>{
          if(error.status == 500){
            this.msg = "Some error occurred, please try again after some time.";
            this.matDialog.open(DialogBodyComponent,{
                data:{message:this.msg,name:"Delete review - Failed"}
            });
          }
        });
      }
    }).catch(()=>{

    })
  }

  public back(){
    this.router.navigate(["/"]);
  }

  public updateReview(id:any):void{
    localStorage.setItem("reviewId",id);
    localStorage.setItem("title",this.title);
    localStorage.setItem("year",this.year.toString());
    const updateModalRef = this.updateReviewModalService.open(UpdateReviewComponent,{ size: 'xl' });
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
    this.confirmationDialogService.confirm("Submit review",'Are you sure to submit?').then(confirmed=>{
      if(confirmed){
        var data = {"title":this.title,"username":this.reviewForm.value['username'],"review":this.reviewForm.value['review'],"rating":parseFloat(this.reviewForm.value['rating']),"likes":this.reviewForm.value['likes']};
        this.movieService.createReviews(data).subscribe((result)=>{
          this.msg= "Your review has been submitted successfully.";
          this.matDialog.open(DialogBodyComponent,{
            data:{message:this.msg,name:"Submit review - Success"}
          });
          this.doReset();
          this.router.navigate(['/movie'],{queryParams:{title:this.title,year:this.year}});
        },error=>{
          if(error.status == 400 || error.status == 500){
            this.msg = "Some error occurred, please try again and check your input as well";
            this.matDialog.open(DialogBodyComponent,{
                data:{message:this.msg,name:"Submit review - Failed"}
            });
          }
        });
      }
    }).catch(()=>{

    });
  }

  public doReset():void{
    this.reviewForm.reset({username:this.reviewForm.get("username").value});
  }

  public formatLabel(value: number) {
    return value;
  }
}
