import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '@/modules/users/users.service';
import { comparePasswordHelper } from '@/common/helpers/util';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await comparePasswordHelper(pass, user.password);
    if (!isPasswordValid) return null;
    return user;
  }

  async generateTokens(_id: string, email: string, role: string) {
    const jti = crypto.randomUUID();
    const at = await this.jwtService.sign({
      sub: _id,
      email,
      role,
      jti,
    });
    return {
      access_token: at,
    };
  }

  async login(user: any) {
    const token = this.generateTokens(user._id, user.email, user.role);
    return token;
  }

  async register(createAuthDto: CreateAuthDto) {
    return await this.usersService.create(createAuthDto);
  }
}
