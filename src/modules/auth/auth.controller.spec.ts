import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { CreateAuthDto } from '@/modules/auth/dto/create-auth.dto';
import { LoginAuthDto } from '@/modules/auth/dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    activateUser: jest.fn(),
    forgotPassword: jest.fn(),
    resetPasswordWithOtp: jest.fn(),
    changePassword: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'TTL_USER_CODE') return 30;
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto: CreateAuthDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      mockAuthService.register.mockResolvedValue({
        _id: '12345',
      });

      const result = await controller.register(dto);
      expect(result).toEqual({ _id: '12345' });
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should set cookie and return access token', async () => {
      const dto: LoginAuthDto = {
        email: 'john.doe@example.com',
        password: 'password',
      };

      const req = { user: { id: '1' } };
      const res = { cookie: jest.fn() };

      mockAuthService.login.mockResolvedValue({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });

      const result = await controller.login(dto, req, res);
      expect(result).toEqual({ access_token: 'access_token' });
      expect(authService.login).toHaveBeenCalledWith(req.user);
    });
  });

  describe('refresh', () => {
    it('should refresh token asnd set cookie', async () => {
      const req = {
        cookies: { refresh_token: 'refresh_token' },
      };
      const res = { cookie: jest.fn() };

      mockAuthService.refreshToken.mockResolvedValue({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      });

      const result = await controller.refresh(req, res);
      expect(result).toEqual({ access_token: 'new_access_token' });
      expect(authService.refreshToken).toHaveBeenCalledWith(
        req.cookies['refresh_token'],
      );
    });
  });

  describe('logout', () => {
    it('should throw UnauthorizedException if no token is provided', async () => {
      const req = {
        headers: {
          authorization: '',
        },
        cookies: {
          refresh_token: 'refresh_token',
        },
      };

      jest
        .spyOn(authService, 'logout')
        .mockRejectedValue(new UnauthorizedException('Invalid access token'));

      await expect(authService.logout).rejects.toThrow(UnauthorizedException);
    });

    it('should call authService.logout with tokens', async () => {
      const req = {
        headers: {
          authorization: 'Bearer access_token',
        },
        cookies: {
          refresh_token: 'refresh_token',
        },
      };
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(req as any);
      expect(result).toBeUndefined();
      expect(authService.logout).toHaveBeenCalledWith(
        req.headers.authorization.split(' ')[1],
        req.cookies.refresh_token,
      );
    });
  });
});
