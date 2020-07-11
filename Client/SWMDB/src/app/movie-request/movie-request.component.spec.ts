import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieRequestComponent } from './movie-request.component';

describe('MovieRequestComponent', () => {
  let component: MovieRequestComponent;
  let fixture: ComponentFixture<MovieRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovieRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
