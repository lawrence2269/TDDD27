import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { SignupService } from './signup.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit{
  signUpForm: FormGroup;
  hide: boolean;
  userRegistration: boolean;
  @ViewChild("email") emailField:ElementRef;
  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
  countries: any = [];
  constructor(private formBuilder:FormBuilder,private signUpService:SignupService) {
    let passwordV = new FormControl('', [Validators.required,Validators.minLength(6)]);
    let confirmPasswordV = new FormControl('',CustomValidators.equalTo(passwordV));
    this.signUpForm = this.formBuilder.group({
      name:new FormControl(null,Validators.required),
      gender:new FormControl(null,Validators.required),
      dateofbirth:new FormControl(null, Validators.required),
      email:new FormControl(null, [Validators.required, Validators.pattern(this.emailRegx)]),
      country:new FormControl(this.countries,Validators.required),
      password:passwordV,
      confirmPassword:confirmPasswordV
    });
    this.hide=true;
    this.userRegistration = false;
   }
  ngOnInit(): void {
    this.signUpService.getCountriesList().subscribe((data)=>{
      console.log(data);
      this.countries = data['countries'];
      this.countries.sort();
    });
  }

  public reset():void{
    this.signUpForm.reset();
  }
  public signUpUser() : void{
    console.log(this.signUpForm.value);
    console.log(this.signUpForm.value['name'])
    this.signUpForm.value['dateofbirth'] = new DatePipe('en').transform(this.signUpForm.value['dateofbirth'], 'yyyy/MM/dd');
    this.signUpService.createUser(this.signUpForm.value).subscribe(res => {

      if(res['message'] == "Success"){
          console.log(res);
          alert("User has been created");
          this.signUpForm.reset();
      }
      else{
        console.log(res);
        alert("User already exists, please check your email Id....");
        this.emailField.nativeElement.focus();
      }
    });
  }
}