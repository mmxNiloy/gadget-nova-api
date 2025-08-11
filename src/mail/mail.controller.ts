import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiBearerAuth('jwt')
  @Post('test')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send a test email' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  @ApiResponse({ status: 500, description: 'Failed to send test email' })
  async sendTestEmail(@Body() body: { to: string }) {
    const { to } = body;
    const success = await this.mailService.sendTestEmail(to);
    
    return {
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email',
    };
  }
} 