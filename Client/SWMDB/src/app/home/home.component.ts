import { HttpParams } from '@angular/common/http';
import { HomeService } from './home.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {Router} from "@angular/router"
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  popular_movie_poster_path:any = []
  popular_movie_title:any = []
  new_movies_poster_path:any = []
  new_movies_title:any = []
  upcoming_movies_poster_path:any = [];
  upcoming_movies_title:any = [];
  constructor(private homeService:HomeService) { }

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
      })
    });

    this.homeService.getPlayingMovies(region).subscribe((data)=>{
        data.newMovies.forEach(elements=>{
          this.new_movies_poster_path.push(elements.poster_path);
          this.new_movies_title.push(elements.title);
        })
    });

    this.homeService.getUpcomingMovies(region).subscribe((data)=>{
        data.upcomingMovies.forEach(elements=>{
        this.upcoming_movies_poster_path.push(elements.poster_path);
        this.upcoming_movies_title.push(elements.title);
      })
    })
  }

  public popularMovieClick(value:String):void{
    console.log(value);
  }

  public playingMovieclick(value:String) : void{
    console.log(value);
  }

  public upcomingMovieClick(value:String) : void{
    console.log(value);
  }
}
