import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipTransform } from '@/common/decorator/customize';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @SkipTransform()
  getHello(): string {
    return this.appService.getHello();
  }
}
