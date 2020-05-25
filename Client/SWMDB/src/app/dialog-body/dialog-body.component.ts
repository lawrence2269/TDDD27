import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-body',
  templateUrl: './dialog-body.component.html',
  styleUrls: ['./dialog-body.component.css']
})
export class DialogBodyComponent implements OnInit {
  message: string = "";
  cancelButtonText = "OK";
  heading = "";
  constructor(public dialogRef: MatDialogRef<DialogBodyComponent>,@Inject(MAT_DIALOG_DATA) public data: any) {

    if(data){
      this.message = data.message || this.message;
      this.heading = data.name || this.heading;
    }
    this.dialogRef.updateSize('300vw','300vw')
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close(true);
  }
}
