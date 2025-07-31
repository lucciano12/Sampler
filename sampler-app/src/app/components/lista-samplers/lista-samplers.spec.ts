import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaSamplers } from './lista-samplers';

describe('ListaSamplers', () => {
  let component: ListaSamplers;
  let fixture: ComponentFixture<ListaSamplers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaSamplers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaSamplers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
