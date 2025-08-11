import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.titan.email',
          port: 587,
          secure: false,
          requireTLS: true,
          logger: true, // Enable debugging logs
          debug: true,
          auth: {
            user: configService.get('TITAN_USER') || 'support@gadgetnovabd.com',
            pass: configService.get('TITAN_PASSWORD') || 'Nova@1234',
          },
        },
        defaults: {
          from: '"Gadget Nova" <support@gadgetnovabd.com>',
        },
      }),
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {} 