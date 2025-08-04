import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LocalAuthUserDto } from '../dto/local-auth-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ 
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true 
    });
  }

  async validate(req: any, email: string, password: string): Promise<any> {
    // Check if user is trying to login with email or phone
    const body = req.body;
    let loginField = email;
    let isEmail = false;

    // Check if email field contains an email
    if (email && email.includes('@')) {
      isEmail = true;
      loginField = email;
    } else if (body.phone) {
      // User sent phone in request body
      isEmail = false;
      loginField = body.phone;
    } else if (email && !email.includes('@')) {
      // User sent phone in email field
      isEmail = false;
      loginField = email;
    } else {
      throw new UnauthorizedException('Invalid login credentials');
    }
    
    const localAuthUser: LocalAuthUserDto = {
      email: isEmail ? loginField : '',
      phone: isEmail ? undefined : loginField,
      password,
    };
    
    const user = await this.authService.validateLocalStrategyUser(
      localAuthUser,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
