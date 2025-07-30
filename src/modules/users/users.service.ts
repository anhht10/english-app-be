import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ForgetPasswordDto,
  UpdateUserActiveDto,
  UpdateUserDto,
} from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { hashPasswordHelper, randomCodeHelper } from '@/common/helpers/util';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  private readonly ttlUserCode: number;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    this.ttlUserCode = this.configService.get<number>('TTL_USER_CODE') || 30;
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const isExisted = await this.checkExisted({ email: email });

    if (!!isExisted) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await hashPasswordHelper(password);

    const code = randomCodeHelper();

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
      code: code,
      codeExp: dayjs().add(this.ttlUserCode, 'minutes'),
    });
    return {
      _id: user._id,
    };
  }

  async findAll() {
    const users = await this.userModel.find();
    return users;
  }

  async findOne(id: String) {
    const user = await this.userModel.findOne({ _id: id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async activeUser(data: UpdateUserActiveDto) {
    const user = await this.userModel.findOne({
      _id: data._id,
      code: data.code,
    });

    if (!user) {
      throw new BadRequestException('Invalid code or user not found');
    }

    const isBeforeExpired = dayjs().isBefore(user.codeExp);
    const used = user.isCodeUsed;

    if (!isBeforeExpired || used) {
      throw new BadRequestException('Code expired or already used');
    } else {
      if (user.isActive) {
        await this.userModel.updateOne({
          isCodeUsed: true,
        });
        return {
          message: 'User is already active',
        };
      }

      await user.updateOne({
        isActive: true,
        isCodeUsed: true,
      });
      return {
        message: 'User activated successfully',
      };
    }
  }

  async resentCode(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const code = randomCodeHelper();

    await user.updateOne({
      code: code,
      codeExp: dayjs().add(this.ttlUserCode, 'minutes'),
      isCodeUsed: false,
    });

    this.mailerService.sendMail({
      to: user.email,
      subject: 'Active your account',
      template: 'register',
      context: {
        name: user.lastName,
        code,
        ttl: this.ttlUserCode,
      },
    });

    return {
      _id: user._id,
      message: 'Code resent successfully',
    };
  }

  async handleForgotPassword(data: ForgetPasswordDto) {
    const user = await this.userModel.findOne({
      email: data.email,
      code: data.code,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isBeforeExpired = dayjs().isBefore(user.codeExp);
    const used = user.isCodeUsed;

    if (!isBeforeExpired || used) {
      throw new BadRequestException('Code expired or already used');
    } else {
      const hashedPassword = await hashPasswordHelper(data.newPassword);

      await user.updateOne({
        password: hashedPassword,
        isCodeUsed: true,
      });

      return {
        _id: user._id,
        message: 'Password updated successfully',
      };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async checkExisted(condition: FilterQuery<User>) {
    return await this.userModel.exists(condition);
  }
}
