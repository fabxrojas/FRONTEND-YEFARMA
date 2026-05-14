import { TestBed } from '@angular/core/testing';

import { GuiaRemisionService } from './guia-remision.service';

describe('GuiaRemisionService', () => {
  let service: GuiaRemisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuiaRemisionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
