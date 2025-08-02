import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from '@/modules/auth/dto/login.dto';
import { Public, ResponseMessage } from '@/common/decorator/customize';
import { LocalAuthGuard } from '@/modules/auth/guards/local-auth.guard';
import { parseDuration } from '@/common/helpers/util';
import {
  ActivateUserDto,
  ChangePasswordDto,
  ForgetPasswordDto,
} from '@/modules/auth/dto/update-auth.dto';
import { ResetPasswordWithOtpDto } from '@/modules/users/dto/update-user.dto';

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
  async login(
    @Body() login: LoginAuthDto,
    @Request() req,
    @Res({ passthrough: true }) res,
  ) {
    const token = await this.authService.login(req.user);

    res.cookie('refresh_token', token.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge:
        1000 *
        parseDuration(
          this.configService.get<string>('JWT_REFRESH_TOKEN_TTL') || '1s',
        ),
      domain: 'localhost',
    });

    return {
      access_token: token.access_token,
    };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    const rt = req.cookies['refresh_token'];
    const token = await this.authService.refreshToken(rt);

    res.cookie('refresh_token', token.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge:
        1000 *
        parseDuration(
          this.configService.get<string>('JWT_REFRESH_TOKEN_TTL') || '1s',
        ),
      domain: 'localhost',
    });

    return {
      access_token: token.access_token,
    };
  }

  @Post('logout')
  @ResponseMessage('Logout successfully')
  async logout(@Req() req: Request) {
    const at = req.headers['authorization']?.split(' ')[1] || '';
    const rt = req['cookies']['refresh_token'];

    await this.authService.logout(at, rt);
  }

  @Post('activate')
  @ResponseMessage('Account activated successfully')
  activate(@Body() activateDto: ActivateUserDto) {
    return this.authService.activateUser(activateDto);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgetPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordWithOtpDto) {
    return await this.authService.resetPasswordWithOtp(resetPasswordDto);
  }

  @Post('change-password')
  changePassword(
    @Request() { user: { _id } },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(_id, changePasswordDto);
  }
}
