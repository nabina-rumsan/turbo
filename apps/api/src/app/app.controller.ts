import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ping')
  getHello() {
    return this.appService.ping();
  }
}
