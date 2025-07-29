import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { hashPasswordHelper, randomCodeHelper } from '@/common/helpers/util';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly ttlUserCode: number;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
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
    return await this.userModel.findOne({ _id: id });
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async checkExisted(condition: FilterQuery<User>) {
    return await this.userModel.exists(condition);
  }
}
