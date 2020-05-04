import { HomeService } from './home.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  popular_movie_poster_path:any = [];
  popular_movie_title:any = [];
  popular_movie_year:any = [];
  new_movies_poster_path:any = [];
  new_movies_title:any = [];
  new_movies_year:any = [];
  upcoming_movies_poster_path:any = [];
  upcoming_movies_title:any = [];
  upcoming_movies_year:any = [];
  constructor(private homeService:HomeService, private router:Router) { }

  ngOnInit(): void 
  {
    let region = "";
    if(sessionStorage.getItem("region") == null)
    {
        sessionStorage.setItem("region","US");
        region = "US";
        console.log(sessionStorage.getItem("region"));
    }
    else
    {
        region = sessionStorage.getItem("region");
        console.log(sessionStorage.getItem("region"));
    }
    this.homeService.getPopularMovies(region).subscribe((data)=>{
      data.popularMovies.forEach(elements=>{
        this.popular_movie_poster_path.push(elements.poster_path);
        this.popular_movie_title.push(elements.title);
        this.popular_movie_year.push(elements.release_year);
      })
    });

    this.homeService.getPlayingMovies(region).subscribe((data)=>{
        data.newMovies.forEach(elements=>{
          this.new_movies_poster_path.push(elements.poster_path);
          this.new_movies_title.push(elements.title);
          this.new_movies_year.push(elements.release_year);
        })
    });

    this.homeService.getUpcomingMovies(region).subscribe((data)=>{
        data.upcomingMovies.forEach(elements=>{
        this.upcoming_movies_poster_path.push(elements.poster_path);
        this.upcoming_movies_title.push(elements.title);
        this.upcoming_movies_year.push(elements.release_year);
      })
    })
  }

  public popularMovieClick(title:String,year:number):void{
    console.log(title);
    this.router.navigate(['/movie'],{queryParams:{title:title,year:year}});
  }

  public playingMovieclick(title:String,year:number) : void{
    console.log(title);
    this.router.navigate(['/movie'],{queryParams:{title:title,year:year}});
  }

  public upcomingMovieClick(title:String,year:number) : void{
    console.log(title);
    this.router.navigate(['/movie'],{queryParams:{title:title,year:year}});
  }
}
