import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UpdateReviewService } from './update-review.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MoviesService } from '../movies/movies.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { DialogBodyComponent } from '../dialog-body/dialog-body.component';

@Component({
  selector: 'app-update-review',
  templateUrl: './update-review.component.html',
  styleUrls: ['./update-review.component.css']
})
export class UpdateReviewComponent implements OnInit {
  updateReviewForm:FormGroup;
  
  reviewStmt:string = "";
  userLike:string = "";
  userRating:string = "";
  ratingsList:any = [];
  msg:string = "";
  userId:string = "";
  likesArray:any = [];

  constructor(private route: ActivatedRoute,private router: Router,private matDialog: MatDialog,private formBuilder:FormBuilder,
    private updateReviewService:UpdateReviewService,public updateReviewModal: NgbActiveModal,private moviesService:MoviesService,
    private confirmationDialogService: ConfirmationDialogService) {
    
    this.updateReviewForm = this.formBuilder.group({
      author:new FormControl(localStorage.getItem("username")),
      review:new FormControl(null,Validators.required),
      likes:new FormControl(null,Validators.required),
      ratings:new FormControl(null,Validators.required)
    });
  }

  ngOnInit(): void 
  {
    this.userId = localStorage.getItem("username");
    this.likesArray.push("Yes");
    this.likesArray.push("No");
    this.moviesService.getRatings().subscribe((data)=>{
      data.ratings.forEach(elements=>{
        this.ratingsList.push(elements);
      });
    });

    this.updateReviewService.getReviewById(localStorage.getItem("reviewId")).subscribe((data)=>{
      this.reviewStmt = data['reviews'][0]['review'];
      if(data['reviews'][0]['likes'] == true){
        this.userLike = "yes";
      }
      else{
        this.userLike = "no";
      }
      this.userRating = data['reviews'][0]['userRating'].toString();
    },error=>{
      console.log(error.message);
    });
  }

  public doReset():void{
    this.updateReviewForm.reset({author:this.updateReviewForm.get("author").value});
  }

  public updateReviews():void{
    this.confirmationDialogService.confirm("Update review",'Are you sure to update?').then((confirmed)=>{
      if(confirmed){
        var data = {"id":localStorage.getItem("reviewId"),"reviewStmt":this.updateReviewForm.value['review'],"userRating":parseFloat(this.updateReviewForm.value['ratings']),"likes":this.updateReviewForm.value['likes']};
        this.updateReviewService.doUpdateReviews(data).subscribe((result)=>{
          this.updateReviewModal.close();
          this.msg= "Your review has been updated successfully.";
          this.matDialog.open(DialogBodyComponent,{
            data:{message:this.msg,name:"Update review - Success"}
          });
          localStorage.removeItem("reviewId");
          this.router.navigate(['/movie'],{queryParams:{title:localStorage.getItem("title"),year:parseInt(localStorage.getItem("year"))}});
          localStorage.removeItem("title");
          localStorage.removeItem("year");
        },error=>{
          if(error.status == 500){
            this.msg = "Some error occurred, please try again after some time.";
            this.matDialog.open(DialogBodyComponent,{
                data:{message:this.msg,name:"Update review - Failed"}
            });
          }
        });
      }
    }).catch(()=>{

    });
  }
}
