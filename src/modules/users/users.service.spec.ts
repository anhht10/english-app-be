import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';
import { UserCodeType } from '@/common/enums';

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
    code: {
      code: 'some-code',
      exp: dayjs().add(30, 'minutes').toDate(),
      isUsed: false,
      type: 'activation',
    },
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
        code: {
          code: 'some-code',
          exp: dayjs().add(30, 'minutes').toDate(),
          isUsed: false,
          type: 'activation',
        },
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
    const updateOne = mockUsersModel.updateOne;
    mockUsersModel.findOne.mockImplementationOnce(() =>
      Promise.resolve({
        ...mockUser,
        updateOne: updateOne,
      }),
    );
    const updateUserActiveDto = {
      _id: 'some-id',
      code: 'some-code',
    };
    const result = await service.activateUser(updateUserActiveDto);
    expect(result).toEqual(expect.any(Object));

    expect(updateOne).toHaveBeenCalledWith({
      $set: {
        'code.isUsed': true,
      },
      isActive: true,
    });
  });

  it('should throw an error if activation code is invalid or user not found', async () => {
    const updateUserActiveDto = {
      _id: 'non-existent-id',
      code: 'non-code',
    };
    await expect(
      service.activateUser(updateUserActiveDto),
    ).rejects.toThrowError(new Error('User not found'));
  });

  it('should throw an error if activation code is invalid', async () => {
    mockUsersModel.findOne.mockImplementationOnce(() =>
      Promise.resolve({
        ...mockUser,
        code: {
          ...mockUser.code,
          code: 'non-code',
          type: 'non-activation',
        },
      }),
    );
    const updateUserActiveDto = {
      _id: 'some-id',
      code: 'some-code',
    };
    await expect(
      service.activateUser(updateUserActiveDto),
    ).rejects.toThrowError(new Error('Invalid code'));
  });

  it('should throw an error if activation code is expired or already used', async () => {
    mockUsersModel.findOne.mockImplementationOnce(() =>
      Promise.resolve({
        ...mockUser,
        code: {
          ...mockUser.code,
          exp: dayjs().subtract(1, 'hour').toDate(),
          isUsed: true,
        },
      }),
    );
    const updateUserActiveDto = {
      _id: 'some-id',
      code: 'some-code',
    };
    await expect(
      service.activateUser(updateUserActiveDto),
    ).rejects.toThrowError(new Error('Code expired or already used'));
  });

  it('should send code to user', async () => {
    const updateOne = mockUsersModel.updateOne;
    mockUsersModel.findOne.mockImplementationOnce(() =>
      Promise.resolve({
        ...mockUser,
        updateOne: updateOne,
      }),
    );

    const sendCodeDto = {
      email: 'john.doe@example.com',
      type: UserCodeType.ACTIVATION,
    };
    const result = await service.sentCode(sendCodeDto);
    expect(result).toEqual(expect.any(Object));

    expect(mockUsersModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ email: sendCodeDto.email }),
    );

    expect(mockMailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: sendCodeDto.email,
        subject: expect.any(String),
        template: expect.any(String),
        context: expect.objectContaining({
          code: expect.any(String),
        }),
      }),
    );
  });

  it('should throw an error if user not found when sending code', async () => {
    const sendCodeDto = {
      email: 'non-john.doe@example.com',
      type: UserCodeType.ACTIVATION,
    };
    await expect(service.sentCode(sendCodeDto)).rejects.toThrow(
      new Error('User not found'),
    );
  });

  it('should throw an error if code type is activation and user is already active', async () => {
    mockUsersModel.findOne.mockImplementationOnce(() =>
      Promise.resolve({
        ...mockUser,
        isActive: true,
        // updateOne: jest.fn(), // not really needed here
      }),
    );

    const sendCodeDto = {
      email: 'john.doe@example.com',
      type: UserCodeType.ACTIVATION,
    };

    await expect(service.sentCode(sendCodeDto)).rejects.toThrowError(
      new Error('User is already active'),
    );
  });

  it('should reset password with OTP', async () => {
    const updateOne = mockUsersModel.updateOne;
    mockUsersModel.findOne.mockResolvedValueOnce({
      ...mockUser,
      updateOne: updateOne,
      code: {
        ...mockUser.code,
        type: UserCodeType.RESET_PASSWORD,
      },
    });

    const resetPasswordWithOtpDto = {
      email: mockUser.email,
      code: mockUser.code.code,
      newPassword: 'NewPassword123!',
    };

    const result = await service.resetPasswordWithOtp(resetPasswordWithOtpDto);
    expect(result).toEqual(expect.any(Object));
  });

  it('should throw an error if user not found when resetting password', async () => {
    const resetPasswordWithOtpDto = {
      email: `non-${mockUser.email}`,
      code: mockUser.code.code,
      newPassword: 'NewPassword123!',
    };

    await expect(
      service.resetPasswordWithOtp(resetPasswordWithOtpDto),
    ).rejects.toThrow(new Error('User not found'));
  });

  it('should throw an error if code is invalid when resetting password', async () => {
    mockUsersModel.findOne.mockResolvedValueOnce({
      ...mockUser,
      code: {
        ...mockUser.code,
        type: 'other-type',
      },
    });

    const resetPasswordWithOtpDto = {
      email: mockUser.email,
      code: 'invalid-code',
      newPassword: 'NewPassword123!',
    };

    await expect(
      service.resetPasswordWithOtp(resetPasswordWithOtpDto),
    ).rejects.toThrow(new Error('Invalid code'));
  });
});
