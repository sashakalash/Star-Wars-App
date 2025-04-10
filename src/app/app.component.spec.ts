import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerEventsSubject: Subject<NavigationEnd>;
  let _router: Router;

  beforeEach(async () => {
    routerEventsSubject = new Subject<NavigationEnd>();

    const routerSpy = {
      events: routerEventsSubject.asObservable(),
    };

    const activatedRouteSpy = {
      snapshot: { url: [] },
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    _router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should set isHomeRoute to true when navigating to /movies', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/movies', '/movies'));
    expect(component.isHomeRoute()).toBe(true);
  });

  it('should set isHomeRoute to false when navigating to a different route', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/other', '/other'));
    expect(component.isHomeRoute()).toBe(false);
  });

  it('should set isHomeRoute to false initially', () => {
    expect(component.isHomeRoute()).toBe(false);
  });

  it('should handle multiple navigation events', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/other', '/other'));
    expect(component.isHomeRoute()).toBe(false);

    routerEventsSubject.next(new NavigationEnd(2, '/movies', '/movies'));
    expect(component.isHomeRoute()).toBe(true);

    routerEventsSubject.next(new NavigationEnd(3, '/another', '/another'));
    expect(component.isHomeRoute()).toBe(false);
  });
});
