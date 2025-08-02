import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RedisService } from '@/core/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let redisService: Partial<RedisService>;
  let configService: Partial<ConfigService>;

  const mockUser = {
    _id: 'user-id',
    email: 'user@example.com',
    password: 'hashedpassword',
    role: 'user',
  };

  const mockTokens: {
    access_token: string;
    refresh_token: `${string}-${string}-${string}-${string}-${string}`;
  } = {
    access_token: 'access-token',
    refresh_token: '123e4567-e89b-12d3-a456-426614174000',
  };

  beforeEach(async () => {
    usersService = {
      // async will automatically return a promise
      // not really needed async but it like the real code
      findByEmail: jest.fn().mockImplementation(async (email: string) => {
        if (email.startsWith('non')) {
          return null; // promise.resolve(null)
        }
        return mockUser;
      }),
      findOne: jest.fn().mockImplementation((_id: string) => {
        if (_id.includes('non')) throw new NotFoundException();

        return Promise.resolve({
          ...mockUser,
          _id: _id,
        });
      }),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue(mockTokens.access_token),
      decode: jest.fn().mockReturnValue({
        sub: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
        jti: mockTokens.refresh_token,
      }),
    };

    redisService = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    configService = {
      get: jest.fn((key) => {
        if (key === 'TTL_USER_CODE') return 30;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      jest
        .spyOn(require('@/common/helpers/util.ts'), 'comparePasswordHelper')
        .mockResolvedValue(true);

      const result = await service.validateUser(
        mockUser.email,
        mockUser.password,
      );

      console.log('validateUser result:', result);

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const result = await service.validateUser(
        'non-existent@example.com',
        'non-password',
      );
      expect(result).toBeNull();
    });

    it('shoutld return null if password is is invalid', async () => {
      jest
        .spyOn(require('@/common/helpers/util.ts'), 'comparePasswordHelper')
        .mockResolvedValue(false);
      const result = await service.validateUser(
        mockUser.email,
        'wrong-password',
      );

      expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      // Pay attention here: because in generateTokens, randomUUID is called once,
      // this function calls generateRefreshToken (error here) which also calls randomUUID
      // so when we mock randomUUID, we need to ensure to mock for both calls
      // instead using once mockReturnValueOnce, we can use mockReturnValue
      // or we can do this
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValueOnce('123e4567-e89b-12d3-a456-426614174000')
        .mockReturnValueOnce(mockTokens.refresh_token); // for generateRefreshToken
      redisService.set = jest.fn().mockResolvedValue(true);
      jwtService.sign = jest.fn().mockReturnValue(mockTokens.access_token);

      const tokens = await service.generateTokens(
        mockUser._id,
        mockUser.email,
        mockUser.role,
      );

      expect(tokens).toEqual({
        access_token: mockTokens.access_token,
        refresh_token: mockTokens.refresh_token,
      });
    });
  });

  describe('generateRefreshToken', () => {
    it('should throw UnauthorizedException if userId is not found in Redis', async () => {
      redisService.get = jest.fn().mockResolvedValue(null);
      const reslut = service.refreshToken('invalid-rt');
      await expect(reslut).rejects.toThrow(UnauthorizedException);
    });
    it('should return new tokens if refresh token is valid', async () => {
      redisService.get = jest.fn().mockResolvedValue(mockUser._id);
      redisService.del = jest.fn().mockResolvedValue(true);
      jest.spyOn(service, 'generateTokens').mockResolvedValue({
        access_token: 'new-access-token',
        refresh_token: '777e4567-e89b-12d3-a456-426614174000',
      });
      const result = await service.refreshToken(mockTokens.refresh_token);
      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: '777e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('shoud throw UnauthorizedException if user not found', async () => {
      redisService.get = jest.fn().mockResolvedValue('non-user-id');
      await expect(service.refreshToken('non-existent-rt')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      jest.spyOn(service, 'generateTokens').mockResolvedValue(mockTokens);
      const result = await service.login(mockUser);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jwtService.decode = jest.fn().mockReturnValue(null);
      await expect(
        service.logout('invalid-token', 'invalid-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('it should delete the refresh token from Redis and add the access token to the blacklist', async () => {
      jwtService.decode = jest.fn().mockReturnValue({
        sub: mockUser._id,
        jti: mockTokens.refresh_token,
        email: mockUser.email,
        role: mockUser.role,
        exp: Date.now() + 1000 * 60 * 60,
      });

      redisService.del = jest.fn().mockResolvedValue(true);
      redisService.set = jest.fn().mockResolvedValue(true);
    });
  });
});
