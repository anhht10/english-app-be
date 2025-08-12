import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ResetPasswordWithOtpDto,
  SendCodeDto,
  UpdateUserActiveDto,
  UpdateUserDto,
} from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import {
  comparePasswordHelper,
  hashPasswordHelper,
  randomCodeHelper,
} from '@/common/helpers/util';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { UserCodeType } from '@/common/enums';

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

    const isExisted = await this.exists({ email: email });

    if (!!isExisted) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await hashPasswordHelper(password);

    const code = randomCodeHelper();

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
      code: {
        code,
        exp: dayjs().add(this.ttlUserCode, 'minutes'),
      },
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

  async activateUser(data: UpdateUserActiveDto) {
    const user = await this.userModel.findOne({
      _id: data._id,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      data.code !== user.code.code ||
      user.code.type !== UserCodeType.ACTIVATION
    ) {
      throw new BadRequestException('Invalid code');
    }

    const isBeforeExpired = dayjs().isBefore(user.code.exp);
    const used = user.code.isUsed;

    if (!isBeforeExpired || used) {
      throw new BadRequestException('Code expired or already used');
    } else {
      if (user.isActive) {
        await this.userModel.updateOne({
          $set: {
            'code.isUsed': true,
          },
        });
        return {
          message: 'User is already active',
        };
      }

      await user.updateOne({
        isActive: true,
        $set: {
          'code.isUsed': true,
        },
      });
      return {
        message: 'User activated successfully',
      };
    }
  }

  async sentCode(data: SendCodeDto) {
    const user = await this.findByEmail(data.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isActive && data.type === UserCodeType.ACTIVATION) {
      throw new BadRequestException('User is already active');
    }

    const code = randomCodeHelper();

    await user.updateOne({
      $set: {
        'code.code': code,
        'code.exp': dayjs().add(this.ttlUserCode, 'minutes'),
        'code.isUsed': false,
        'code.type': data.type,
      },
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

  async resetPasswordWithOtp(data: ResetPasswordWithOtpDto) {
    const user = await this.userModel.findOne({
      email: data.email,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      data.code !== user.code.code ||
      user.code.type !== UserCodeType.RESET_PASSWORD
    ) {
      throw new BadRequestException('Invalid code');
    }

    const isBeforeExpired = dayjs().isBefore(user.code.exp);
    const used = user.code.isUsed;

    if (!isBeforeExpired || used) {
      throw new BadRequestException('Code expired or already used');
    } else {
      const hashedPassword = await hashPasswordHelper(data.newPassword);

      await user.updateOne({
        password: hashedPassword,
        $set: {
          'code.isUsed': true,
        },
      });

      return {
        _id: user._id,
        message: 'Password updated successfully',
      };
    }
  }

  async changePassword({ id, currentPassword, newPassword }) {
    const user = await this.userModel.findOne({ _id: id });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isMatch = await comparePasswordHelper(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await hashPasswordHelper(newPassword);
    user.updateOne({
      password: hashedPassword,
    });
    return {
      _id: user._id,
      message: 'Password changed successfully',
    };
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async exists(condition: FilterQuery<User>) {
    return await this.userModel.exists(condition);
  }
}
