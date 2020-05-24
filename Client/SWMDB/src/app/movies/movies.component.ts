import { Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
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
  collection:any = [];
  temp:any = [];
  collection_temp:any = [];
  moviesForm:FormGroup;
  content_length:number = 0;
  color = 'primary';
  labelPosition = 'after';
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

    this.moviesService.getAllMovies().subscribe((data)=>{
      data.movies.forEach(elements=>{
        this.collection.push(elements);
      });
    });

    this.moviesForm = this.formBuilder.group({
      years : new FormControl(this.movieYears),
      genre : new FormControl(this.genreList),
      ratings : new FormControl(this.ratingsList),
      searchText : new FormControl(null)
    });
  }

  async ngOnInit() {
    await this.movieData();
    console.log("====>",this.collection_temp);
    this.content_length = this.collection_temp.length;
  }

  onAdultContent(value){
    this.status = value? "Yes":"No";
  }

  movieData(){
    return new Promise(resolve=>{
      this.moviesService.getAllMovies().subscribe((data)=>{
        data.movies.forEach(elements=>{
          this.collection_temp.push(elements);
        });
        resolve(this.collection_temp);
      });
    });
}

  movieDetails(title:String,year:number):void{
    this.router.navigate(['/movie'],{queryParams:{title:title,year:year}});
  }

  onPageChange($event) {
    this.collection =  this.collection_temp.slice($event.pageIndex*$event.pageSize, $event.pageIndex*$event.pageSize + $event.pageSize);
  }
}
