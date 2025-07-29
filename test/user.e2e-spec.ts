import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { disconnect, Model } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { UsersModule } from '@/modules/users/users.module';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;

  const mockUserUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '1234567890',
    avatar: 'avatar.png',
    role: 'user',
    isActive: false,
    isCodeUsed: false,
    code: 'some-code',
    codeExp: new Date().toISOString(),
  };

  const mockUserRepository = {
    find: jest.fn().mockResolvedValue([mockUserUser]),
    create: jest.fn((dto) => ({
      _id: 'some-id',
      ...dto,
      role: 'user',
      isActive: false,
      isCodeUsed: false,
      codeExp: new Date().toISOString(),
      code: 'some-code',
    })),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect([mockUserUser]);
    //   .expect(mockUserUser);
  });

  it('/users (POST)', () => {
    const createUserDto: CreateUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect('Content-Type', /json/)
      .expect(201)
      .then((res) => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          ...createUserDto,
          role: 'user',
          isActive: false,
          isCodeUsed: false,
          codeExp: expect.any(String),
          code: expect.any(String),
        });
      });
  });

  afterAll(async () => {
    await app.close();
    await disconnect();
  });
});
