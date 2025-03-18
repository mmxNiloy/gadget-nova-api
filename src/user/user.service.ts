import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { LocalAuthUserDto } from 'src/auth/dto/local-auth-user.dto';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { CryptoUtil } from 'src/common/utils/crypto.util';
import { UserFilterUtil } from 'src/common/utils/user-filter.util';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserReponseDto } from './dto/user-response.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { UserEntity } from './entities/user.entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly crypto: CryptoUtil,
    private readonly userFilterUtil: UserFilterUtil,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(registerUserDto: RegisterUserDto): Promise<UserEntity> {
    const isEmailDuplicate = await this.userRepository.findOne({
      where: { email: registerUserDto.email },
    });

    if (isEmailDuplicate) {
      throw new BadRequestException('Email already exist!');
    }

    registerUserDto.password = await this.crypto.hashPassword(
      registerUserDto.password,
    );

    const verificationToken = this.generateVerificationToken();

    const refreshToken = (Math.random() * 0xfffff * 1000000).toString(16);
    const userEntity = {
      ...registerUserDto,
      verification_token: verificationToken,
      is_active: ActiveStatusEnum.ACTIVE,
      refresh_token: refreshToken,
      created_at: new Date(),
    };


    const user = await this.userRepository.save(userEntity);
    delete user.password;
    return user;
  }

  async validateUserEmailPass(
    localUser: LocalAuthUserDto,
  ): Promise<UserReponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: localUser.email },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (
      !(await this.crypto.comparePassword(localUser.password, user.password))
    ) {
      throw new UnauthorizedException('Login credentials not accepted');
    }

    delete user.password;

    //generate token
    const access_token = this.generateJwtToken(user);

    const refreshToken = (Math.random() * 0xfffff * 1000000).toString(16);
    user.refresh_token = refreshToken;
    await user.save();
    return { ...user, access_token };
  }

  private generateJwtToken(user: UserEntity): string {
    const payload = {
      id: user.id,
      email: user.email,
      userName: user.name,
      role: user.role
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '30m',
    });

    return token;
  }

  async generateAccessToken(token: string) {
    try {
      console.log({token});
      const user = await this.userRepository.findOne({
        where: { refresh_token: token },
      });

      

      if (!user) {
        throw new NotFoundException('Refresh token is not valid');
      }

      const access_token = this.generateJwtToken(user);

      user.refresh_token = (Math.random() * 0xfffff * 1000000).toString(16);

      await user.save();

      return { ...user, access_token };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  generateVerificationToken(): string {
    const timestamp = new Date().getTime().toString(16).slice(-8);
    const randomToken = (Math.random() * 0xfffff * 1000000)
      .toString(16)
      .slice(0, 12);

    const verificationToken = timestamp + randomToken;
    return verificationToken;
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        is_active: ActiveStatusEnum.ACTIVE,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserById(
    id: string,
    userDto: UpdateUserDto,
  ): Promise<UserEntity> {
    try {
      const user = await this.findById(id);

      const updateduser = {
        ...user,
        ...userDto,
      };

      return await this.userRepository.save(updateduser);
    } catch (error) {
      throw new BadRequestException('Failed to update User');
    }
  }


  async generatePasswordResetToken(userId: string): Promise<string> {
    const payload = { userId };

    const expiresIn = '1h';

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn,
    });
    const dto = {
      reset_password_token: token,
    };

    await this.updateUserById(userId, dto);

    return token;
  }

  async resetUserPassword(
    token: string,
    newPassword: string,
    confirmNewPassword: string,
  ): Promise<UserEntity> {
    try {
      const decodedToken = jwt.verify(
        token,
        this.configService.get('JWT_SECRET'),
      ) as { exp: number };

      if (Date.now() > decodedToken.exp * 1000) {
        throw new BadRequestException('Token has expired');
      }

      const user = await this.userRepository.findOne({
        where: {
          reset_password_token: token,
        },
      });

      if (!user) {
        throw new NotFoundException('Invalid or expired token');
      }

      if (newPassword !== confirmNewPassword) {
        throw new BadRequestException(
          "New Password and confirm password don't match",
        );
      }

      const hashedPassword = await this.crypto.hashPassword(newPassword);

      const dto = {
        password: hashedPassword,
        reset_password_token: null,
      };
      return this.updateUserById(user.id, dto);
    } catch (error) {
      throw new BadRequestException('Failed to reset password');
    }
  }

  async changePassword(
    jwtPayload: JwtPayloadInterface,
    previousPassword: string,
    confirmNewPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await this.findById(jwtPayload.id);

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const passwordMatch = await this.crypto.comparePassword(
        previousPassword,
        user.password,
      );

      if (!passwordMatch) {
        throw new BadRequestException('Invalid previous password');
      }

      if (newPassword !== confirmNewPassword) {
        throw new BadRequestException('New passwords do not match');
      }

      const hashedNewPassword = await this.crypto.hashPassword(newPassword);
      user.password = hashedNewPassword;
      await user.save();
    } catch (error) {
      throw new BadRequestException('Failed to reset password');
    }
  }

  async getAll(dto: UserSearchDto): Promise<UserEntity[]> {
    const query = await this.userRepository
      .createQueryBuilder('user')
      .where('user.is_active = :is_active', { is_active: ActiveStatusEnum.ACTIVE });

    if (dto.userName) {
      query.andWhere('lower(user.name) like :userName', {
        userName: `%${dto.userName.toLowerCase()}%`,
      });
    }

    const users = await query.getMany();
    const filteredUsers = users.map((user) =>
      this.userFilterUtil.filterSensitiveFields(user),
    );

    return filteredUsers;
  }

  async getProfile(jwtPayload: JwtPayloadInterface): Promise<UserEntity> {
    try {      
      const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId: jwtPayload.id })
      .andWhere('user.is_active = :userStatus', {
        userStatus: ActiveStatusEnum.ACTIVE,
      })
      .getOne();

    const filteredUser = this.userFilterUtil.filterSensitiveFields(user);

    return filteredUser;
    } catch (error) {
      throw new BadRequestException(error?.response);
    }
  }

  async getUserById(id:string): Promise<UserEntity> {
    try {
      const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId: id })
      .getOne();

    return user;
    } catch (error) {
      throw new BadRequestException(error?.response);
    }
  }

  async update(
    userDto: UpdateUserDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<UserEntity> {
    try {
      const user = await this.getProfile(jwtPayload);

      const updatedWorkspace = {
        ...user,
        ...userDto,
        updated_at: new Date(),
        updated_by: jwtPayload.id,
      };

      const updated = await this.userRepository.save(updatedWorkspace);

      return updated;
    } catch (error) {
      throw new BadRequestException(error.response.message);
    }
  }

  async findByIds(userIds: string[]): Promise<UserEntity[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder.where('user.id IN (:...userIds)', { userIds });

    const users = await queryBuilder.getMany();

    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    return users;
  }

  async logOut(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (user.refresh_token === null) {
        throw new BadRequestException('You are already logged out!');
      }
      user.refresh_token = null;
      user.save();
      return this.userFilterUtil.filterSensitiveFields(user);
    } catch (error) {
      throw new BadRequestException(error.response.message);
    }
  }
}
