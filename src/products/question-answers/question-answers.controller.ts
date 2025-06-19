import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { QuestionAnswersService } from './question-answers.service';
import { CreateQuestionAnswersDto } from '../dto/create-question-answers.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';

@ApiTags('Question-answers')
@Controller({
  path: 'Question-answers',
  version: '1',
})
export class QuestionAnswersController {
  constructor(private readonly questionAnswersService: QuestionAnswersService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Post()
  async create(
    @Body() createQuestionAnswersDto: CreateQuestionAnswersDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.questionAnswersService.create(createQuestionAnswersDto, jwtPayload);
    return { message: 'Answer created successfully', payload };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payload = await this.questionAnswersService.findOne(id);
    return { message: 'Answer details', payload };
  }

  @Get('question/:id')
  async findQuestionByProduct(@Param('id') id: string) {
    const payload = await this.questionAnswersService.findQuestionsByProduct(id);
    return { message: 'Answer details', payload };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.questionAnswersService.remove(id, jwtPayload);
    return { message: 'Answer deleted successfully', payload };
  }
}
