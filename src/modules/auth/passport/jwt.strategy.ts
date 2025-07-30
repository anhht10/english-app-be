import { RedisService } from '@/core/redis/redis.service';
import { UsersService } from '@/modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') || '?',
    });
  }

  async validate(payload: any) {
    const isBacklisted = await this.redisService.get(
      `blacklist:${payload.jti}`,
    );
    console.log(payload);

    if (isBacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    return { _id: payload.sub, email: payload.email, role: payload.role };
  }
}
