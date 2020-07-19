import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-movie-not-found',
  templateUrl: './movie-not-found.component.html',
  styleUrls: ['./movie-not-found.component.css']
})
export class MovieNotFoundComponent implements OnInit {

  constructor(private route: ActivatedRoute,private router: Router) { }

  public back(){
    this.router.navigate(["/"]);
  }

  ngOnInit(): void {
  }

}
