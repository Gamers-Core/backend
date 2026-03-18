import { Controller } from '@nestjs/common';

import { BostaService } from './bosta.service';

@Controller('bosta')
export class BostaController {
  constructor(private readonly bostaService: BostaService) {}
}
