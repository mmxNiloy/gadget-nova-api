import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesEnum } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<RolesEnum[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log({user});
    

    if (!user || !user.role) {
      throw new ForbiddenException('Access Denied: No role assigned');
    }

    const roleHierarchy: Record<RolesEnum, RolesEnum[]> = {
      [RolesEnum.SUPER_ADMIN]: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.USER],
      [RolesEnum.ADMIN]: [RolesEnum.ADMIN, RolesEnum.USER],
      [RolesEnum.USER]: [RolesEnum.USER],
    };

    if (roleHierarchy[user.role]?.some((role) => requiredRoles.includes(role))) {
      return true;
    }

    throw new ForbiddenException('Access Denied: Insufficient Permissions');
  }
}
