import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';
import { mock } from 'node:test';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    _id: 'some-id',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashed-password',
    role: 'user',
    phone: '',
    avatar: '',
    milestoneId: null,
    isActive: false,
    isCodeUsed: false,
    codeExp: dayjs().add(30, 'minutes').toDate(),
    code: 'some-code',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersModel = {
    create: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        _id: 'some-id',
        ...dto,
        role: 'user',
        phone: '',
        avatar: '',
        milestoneId: null,
        isActive: false,
        isCodeUsed: false,
        codeExp: new Date(),
        code: 'some-code',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
    findOne: jest.fn().mockImplementation((filter: any) => {
      const hasValueContainingNon = Object.values(filter).some(
        (value) => typeof value === 'string' && value.includes('non'),
      );

      if (hasValueContainingNon) {
        return Promise.resolve(null);
      }
      return Promise.resolve({
        ...mockUser,
        ...filter,
      });
    }),

    updateOne: jest.fn().mockResolvedValue({
      acknowledged: true,
      modifiedCount: 1,
    }),

    exists: jest.fn().mockResolvedValue(false),
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'TTL_USER_CODE') return 30;
      return null;
    }),
  };

  const mockMailerService = {
    sendMail: jest.fn(() => Promise.resolve(true)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUsersModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto = {
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      email: mockUser.email,
      password: 'password123',
    };

    const result = await service.create(createUserDto);
    expect(result).toEqual({
      _id: expect.any(String),
    });
    expect(mockUsersModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: expect.any(String), // hashed password
      }),
    );
  });

  it('should throw an error if user already exists', async () => {
    mockUsersModel.exists.mockImplementationOnce(() => Promise.resolve(true));

    const createUserDto: CreateUserDto = {
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      email: mockUser.email,
      password: 'password123',
    };

    await expect(service.create(createUserDto)).rejects.toThrowError(
      new Error('Email already exists'),
    );
  });

  it('should find a user by ID', async () => {
    const user = await service.findOne('some-id');
    expect(user).toEqual({
      ...mockUser,
      _id: 'some-id',
    });

    expect(mockUsersModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: expect.any(String) }),
    );
  });

  it('should throw an error if user not found by ID', async () => {
    // mockUsersModel.findOne.mockImplementationOnce(() => Promise.resolve(null));
    await expect(service.findOne('non-existent-id')).rejects.toThrowError(
      new Error('User not found'),
    );
  });

  it('should find a user by email', async () => {
    const user = await service.findByEmail('john.doe@example.com');
    expect(user).toEqual({
      ...mockUser,
      email: 'john.doe@example.com',
    });
    expect(mockUsersModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ email: expect.any(String) }),
    );
  });

  it('should return null if user not found by email', async () => {
    mockUsersModel.findOne.mockImplementationOnce(() => Promise.resolve(null));
    const user = await service.findByEmail('non-existent@example.com');
    expect(user).toBeNull();
  });

  it('should activate a user', async () => {
    mockUsersModel.findOne.mockImplementationOnce(() =>
      Promise.resolve({
        ...mockUser,
        updateOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          modifiedCount: 1,
        }),
      }),
    );
    const updateUserActiveDto = {
      _id: 'some-id',
      code: 'some-code',
    };
    const result = await service.activeUser(updateUserActiveDto);
    expect(result).toEqual(expect.any(Object));

    // expect(mockUsersModel.).toHaveBeenCalledWith(
    //   { _id: 'some-id', code: 'some-code' },
    //   { isActive: true, isCodeUsed: true },
    // );
  });

  it('should throw an error if activation code is invalid or user not found', async () => {
    const updateUserActiveDto = {
      _id: 'non-existent-id',
      code: 'invalid-code',
    };
    await expect(service.activeUser(updateUserActiveDto)).rejects.toThrowError(
      new Error('Invalid code or user not found'),
    );
  });

  it('should throw an error if activation code is expired or already used', async () => {
    mockUsersModel.findOne.mockImplementationOnce(() =>
      Promise.resolve({
        ...mockUser,
        isCodeUsed: true,
        codeExp: dayjs().subtract(1, 'hour').toDate(),
      }),
    );
    const updateUserActiveDto = {
      _id: 'some-id',
      code: 'some-code',
    };
    await expect(service.activeUser(updateUserActiveDto)).rejects.toThrowError(
      new Error('Code expired or already used'),
    );
  });
});
