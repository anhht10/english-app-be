import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { disconnect, Model } from 'mongoose';
import { UsersModule } from '@/modules/users/users.module';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { TransformInterceptor } from '@/core/interceptors/transform/transform.interceptor';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let userModel: Model<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
          inject: [ConfigService],
        }),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    const reflector = moduleFixture.get('Reflector');
    app.useGlobalInterceptors(new TransformInterceptor(reflector));
    await app.init();
    userModel = app.get<Model<User>>(getModelToken(User.name));
  });

  // it('/users (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/users')
  //     .expect('Content-Type', /json/)
  //     .expect(200)
  //     .expect(mockUserUser);
  //   //   .expect(mockUserUser);
  // });

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
      .expect((res) => {
        expect(res.body).toEqual({
          statusCode: 201,
          message: expect.any(String),
          data: expect.objectContaining({
            _id: expect.any(String),
          }),
        });
      });
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await app.close();
    await disconnect();
  });
});
