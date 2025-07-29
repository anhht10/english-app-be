import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersService = {
    // create is like create in this.usersService.create(createUserDto);
    create: jest.fn((dto) =>
      Promise.resolve({
        _id: 'some-id',
        ...dto,
        role: 'user',
        isActive: false,
        isCodeUsed: false,
        codeExp: new Date(),
        code: 'some-code',
      }),
    ),

    exists: jest.fn(() => Promise.resolve(false)),
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'TTL_USER_CODE') return 30;
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const result = await service.create(createUserDto);
    expect(result).toEqual({
      _id: expect.any(String),
    });
    expect(mockUsersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: expect.any(String), // hashed password
      }),
    );
  });
});
