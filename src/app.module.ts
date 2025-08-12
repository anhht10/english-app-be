import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TransformInterceptor } from '@/core/interceptors/transform/transform.interceptor';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { LearningContentsModule } from './modules/learning-contents/learning-contents.module';
import { NotesModule } from './modules/notes/notes.module';
import { SlugCounterModule } from './modules/slug-counter/slug-counter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          secure: configService.get<boolean>('MAIL_SECURE'),
          port: configService.get<number>('MAIL_PORT'),
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
          defaults: {
            from: configService.get<string>('MAIL_DEFAULT_FROM'),
          },
          template: {
            dir: process.cwd() + '/src/common/templates/mail/',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: configService.get<boolean>('MAIL_TEMPLATE_STRICT'),
            },
          },
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    MilestonesModule,
    AuthModule,
    LearningContentsModule,
    NotesModule,
    SlugCounterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
