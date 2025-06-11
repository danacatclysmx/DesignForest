import { TestBed } from '@angular/core/testing';

import { ConglomeradoService } from './conglomerado.service';

describe('ConglomeradoService', () => {
  let service: ConglomeradoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConglomeradoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
