import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity/user.entity';
import { CryptoUtil } from 'src/common/utils/crypto.util';
import { JwtService } from '@nestjs/jwt';
import { UserFilterUtil } from 'src/common/utils/user-filter.util';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    UserService,
    CryptoUtil,
    JwtService,
    UserFilterUtil,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
