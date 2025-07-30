import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '@/modules/users/users.service';
import { comparePasswordHelper, parseDuration } from '@/common/helpers/util';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/core/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
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
    const [at, rt] = await Promise.all([
      await this.jwtService.sign({
        sub: _id,
        email,
        role,
        jti,
      }),
      this.generateRefreshToken(_id),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async generateRefreshToken(_id: string) {
    const jti = crypto.randomUUID();
    await this.redisService.set(
      `refresh:${jti}`,
      _id,
      'EX',
      parseDuration(
        this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED') || '1s',
      ),
    );
    return jti;
  }

  async refreshToken(rt: string) {
    const userId = await this.redisService.get(`refresh:${rt}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.redisService.del(`refresh:${rt}`);
    const user = await this.usersService.findOne(userId);
    
    try {
      const user = await this.usersService.findOne(userId);
      return this.generateTokens(userId, user.email, user.role);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new UnauthorizedException('User not found');
      }
      throw err;
    }
  }

  async login(user: any) {
    const token = this.generateTokens(user._id, user.email, user.role);
    return token;
  }

  async register(createAuthDto: CreateAuthDto) {
    return await this.usersService.create(createAuthDto);
  }

  async logout(token: string) {
    const decoded = this.jwtService.decode(token);
    if (!decoded || typeof decoded !== 'object' || !decoded['jti']) {
      throw new UnauthorizedException('Invalid token');
    }

    const expiresAt = decoded['exp'] * 1000;
    const ttl = expiresAt - Date.now();

    if (ttl > 0) {
      await this.redisService.set(
        `blacklist:${decoded['jti']}`,
        'true',
        'PX',
        ttl,
      );
    }
  }
}
