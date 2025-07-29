import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn((dto) => {
      return {
        id: 'some-id',
        ...dto,
        role: 'user',
        isActive: false,
        isCodeUsed: false,
        codeExp: new Date(),
        code: 'some-code',
      };
    }),
    update: jest.fn((id, dto) => ({
      id,
      ...dto,
      milestoneId: 'some-milestone-id',
      role: 'user',
      isActive: false,
      isCodeUsed: false,
      codeExp: new Date(),
      code: 'some-code',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', () => {
    const createUserDto: CreateUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    expect(controller.create(createUserDto)).toEqual({
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

  it('should update a user', () => {
    const updateUserDto = {
      firstName: 'Jane',
      lastName: 'Doe',
    };

    expect(controller.update('1', updateUserDto)).toEqual({
      id: '1',
      ...updateUserDto,
      role: 'user',
      milestoneId: expect.any(String),
      isActive: expect.any(Boolean),
      isCodeUsed: expect.any(Boolean),
      codeExp: expect.any(Date),
      code: expect.any(String),
    });

    expect(mockUsersService.update).toHaveBeenCalledWith('1', updateUserDto);
  });
});
