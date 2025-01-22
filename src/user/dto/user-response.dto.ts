import { LocalAuthUserDto } from 'src/auth/dto/local-auth-user.dto';

export class UserReponseDto extends LocalAuthUserDto {
  id: string;
  access_token: string;
  refresh_token: string;
}
