import { Injectable, BadRequestException } from '@nestjs/common';
import { CodStrategy } from './strategies/cod-strategy';
import { SslStrategy } from './strategies/ssl-strategy';

@Injectable()
export class PGWContext {
  constructor(private cod: CodStrategy, private ssl: SslStrategy) {}

  getStrategy(method: string) {
    switch (method) {
      case 'COD':
        return this.cod;
      case 'SSL':
        return this.ssl;
      default:
        throw new BadRequestException('Invalid payment method');
    }
  }
}