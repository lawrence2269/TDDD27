import { MovieService } from './movie/movie.service';
import { HomeService } from './home/home.service';
import { SignupService } from './signup/signup.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCardModule} from '@angular/material/card';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { RouterModule, Router } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { MatNativeDateModule } from '@angular/material/core';
import {MatDividerModule} from '@angular/material/divider';
import { HttpClientModule } from '@angular/common/http';
import { BsNavbarComponent } from './bs-navbar/bs-navbar.component';
import { MovieComponent } from './movie/movie.component';
import { MoviesComponent } from './movies/movies.component';
import { MoviesService } from './movies/movies.service';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogBodyComponent } from './dialog-body/dialog-body.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { MovieRequestComponent } from './movie-request/movie-request.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyOTPComponent } from './verify-otp/verify-otp.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { AddMoviesComponent } from './add-movies/add-movies.component';
import {MatSliderModule} from '@angular/material/slider';
import { UpdateReviewComponent } from './update-review/update-review.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider
} from 'angularx-social-login';
import { MovieNotFoundComponent } from './movie-not-found/movie-not-found.component';
import { AuthGuardService } from './authGuard/auth-guard.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    BsNavbarComponent,
    MovieComponent,
    MoviesComponent,
    DialogBodyComponent,
    MovieRequestComponent,
    ConfirmationDialogComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    VerifyOTPComponent,
    ResetPasswordComponent,
    ManageUsersComponent,
    AddMoviesComponent,
    UpdateReviewComponent,
    MovieNotFoundComponent
  ],
  imports: [
    BrowserModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    NgSelectModule,
    HttpClientModule,
    CustomFormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatCardModule,
    MatSliderModule,
    Ng2SearchPipeModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    RouterModule.forRoot([
      {path: '', component: HomeComponent},
      {path: 'login', component:LoginComponent},
      {path: 'signup', component:SignupComponent},
      {path: 'movies',component:MoviesComponent},
      {path: 'movie',component:MovieComponent},
      {path: 'movierequest',component:MovieRequestComponent,canActivate:[AuthGuardService]},
      {path: 'chgpassword',component:ChangePasswordComponent,canActivate:[AuthGuardService]},
      {path: 'forgotpwd',component:ForgotPasswordComponent},
      {path: 'verifyOTP',component:VerifyOTPComponent},
      {path: 'resetpwd', component:ResetPasswordComponent},
      {path: 'manageusr',component:ManageUsersComponent,canActivate:[AuthGuardService]},
      {path: 'addmovie',component:AddMoviesComponent,canActivate:[AuthGuardService]},
      {path: 'updatereview',component:UpdateReviewComponent,canActivate:[AuthGuardService]},
      {path: 'movienotfound',component:MovieNotFoundComponent},
      {path: '**',redirectTo:''}
    ]),
    NgbModule
  ],
  providers: [
    SignupService,
    HomeService,
    MovieService,
    MoviesService,
    DatePipe,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '434418122452-vlq9p2aii1qdls02tuechiei12tc8ep4.apps.googleusercontent.com'
            ),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('578017606194849'),
          },
        ],
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ForgotPasswordComponent,
    VerifyOTPComponent,
    ResetPasswordComponent,
    UpdateReviewComponent
  ]
})
export class AppModule { }
