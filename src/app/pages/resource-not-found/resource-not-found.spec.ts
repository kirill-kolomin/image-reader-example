import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceNotFound } from './resource-not-found';

describe('ResourceNotFound', () => {
  let component: ResourceNotFound;
  let fixture: ComponentFixture<ResourceNotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceNotFound]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceNotFound);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
