import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {Router} from "@angular/router"

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void 
  {
    if(localStorage.getItem("region") == null)
    {
        localStorage.setItem("region","US")
        console.log(localStorage.getItem("region"))
    }
    else
    {
        console.log(localStorage.getItem("region"))
    }
    
  }

  // public testLocal(): void{
  //   if(localStorage.getItem("region") == null){
  //     localStorage.setItem("region","US")
  //     console.log(localStorage.getItem("region"))
  //   }
  //   else{
  //     console.log(localStorage.getItem("region"))
  //   }
  // }
}
