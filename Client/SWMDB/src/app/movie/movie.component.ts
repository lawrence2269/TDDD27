import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {
  regionCode:String = "";
  year:number = 0;
  constructor(private route: ActivatedRoute,private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params=>{
      this.regionCode = params['title'];
      this.year = params['year'];
    });
    console.log("Inside Movie component : "+this.regionCode+" ,"+this.year);
  }

}
