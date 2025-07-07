import { Injectable, BadRequestException } from '@nestjs/common';
import { CodStrategy } from './strategies/cod-strategy';
import { SslStrategy } from './strategies/ssl-strategy';
import { BkashStrategy } from './strategies/bkash-strategy';

@Injectable()
export class PGWContext {
  constructor(
    private cod: CodStrategy, 
    private ssl: SslStrategy,
    private bkash: BkashStrategy
  ) {}

  getStrategy(method: string) {
    switch (method) {
      case 'COD':
        return this.cod;
      case 'SSL':
        return this.ssl;
      case 'BKASH':
        return this.bkash;
      default:
        throw new BadRequestException('Invalid payment method. Supported methods: COD, SSL, BKASH');
    }
  }
}