import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersService = {
    // create is like create in this.usersService.create(createUserDto);
    create: jest.fn((dto) => ({
      id: 'some-id',
      ...dto,
      role: 'user',
      isActive: false,
      isCodeUsed: false,
      codeExp: new Date(),
      code: 'some-code',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUsersService,
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
      id: expect.any(String),
      ...createUserDto,
      role: 'user',
      isActive: false,
      isCodeUsed: false,
      codeExp: expect.any(Date),
      code: expect.any(String),
    });
    expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
  });
});
