import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/entities/user.entity/user.entity';

@Injectable()
export class UserFilterUtil {
  filterSensitiveFields(user: any): any {
    const filteredUser = {
      id: user.id,
      is_active: user.is_active,
      name: user.name,
      email: user.email,
      is_verified: user.is_verified,
      profile_image_url: user.profile_image_url,
      role: user.role
    };

    return filteredUser;
  }
}
