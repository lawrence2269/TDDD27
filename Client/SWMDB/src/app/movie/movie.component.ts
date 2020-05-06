import { MovieService } from './movie.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { angularMath } from 'angular-ts-math';

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
  trailer:String = "";
  tmdb_id:number = 0;
  imdb_id:String = "";
  rating:number = 0;
  like_count:number = 0;

  constructor(private route: ActivatedRoute,private router: Router,private movieService: MovieService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params=>{
      this.title = params['title'];
      this.year = params['year'];
    });
    console.log("Inside Movie component : "+this.title+" ,"+this.year);
    this.movieService.getMovieDetails(this.title,this.year).subscribe((data)=>{
        this.genre = data.movieDetails.genre;
        this.adult_Content = data.movieDetails.adult_Content;
        this.poster_path = data.movieDetails.poster_path;
        this.runTime = this.runTimeConversion(data.movieDetails.runtime);
        this.synopsis = data.movieDetails.synopsis;
        this.trailer = data.movieDetails.trailer;
        this.tmdb_id = data.movieDetails.tmdb_id;
        this.imdb_id = data.movieDetails.imdb_id
        this.rating = data.movieDetails.rating;
        this.like_count = data.movieDetails.likes;
        console.log(this.poster_path+"\t"+this.adult_Content);
    });
  }

  runTimeConversion(value:number):String{
    let hours = (value/60);
    let rhours = Math.floor(hours);
    let minutes = (hours-rhours)*60;
    let rminutes = Math.round(minutes);
    return rhours+" hour(s) and "+rminutes+" minute(s)";
  }
}
