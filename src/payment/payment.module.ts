import { Module } from '@nestjs/common';
import { PGWContext } from './pgw.context';
import { CodStrategy } from './strategies/cod-strategy';
import { SslStrategy } from './strategies/ssl-strategy';

@Module({
  providers: [CodStrategy, SslStrategy, PGWContext],
  exports: [PGWContext],
})
export class PaymentModule {}
