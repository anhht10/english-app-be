import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from '@/modules/auth/dto/login.dto';
import { Public, ResponseMessage } from '@/common/decorator/customize';
import { LocalAuthGuard } from '@/modules/auth/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ResponseMessage('Registration successful')
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login successful')
  async login(@Request() req) {
    const token = await this.authService.login(req.user);
    return {
      access_token: token.access_token,
    };
  }
}
