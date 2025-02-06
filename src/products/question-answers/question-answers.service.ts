import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { Repository } from 'typeorm';
import { CreateQuestionAnswersDto } from '../dto/create-question-answers.dto';
import { QuestionAnswersEntity } from '../entities/question-answers.entity';
import { ProductsQuestionsService } from '../product-questions/products-questions.service';

@Injectable()
export class QuestionAnswersService {
  constructor(
    @InjectRepository(QuestionAnswersEntity)
    private readonly questionAnswersRepository: Repository<QuestionAnswersEntity>,
    private readonly productsQuestionsService: ProductsQuestionsService,
  ) {}

  async create(
    createQuestionAnswersDto: CreateQuestionAnswersDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<QuestionAnswersEntity> {
    try {
      const question = await this.productsQuestionsService.findOne(
        createQuestionAnswersDto.question_id,
      );

      if (!question) {
        throw new NotFoundException('Question not found');
      }

      delete createQuestionAnswersDto.question_id;

      const questionAnswersEntity = this.questionAnswersRepository.create({
        ...createQuestionAnswersDto,
        question: question,
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
      });

      return await this.questionAnswersRepository.save(questionAnswersEntity);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string): Promise<QuestionAnswersEntity> {
    const answer = await this.questionAnswersRepository.findOne({
      where: { id, is_active: ActiveStatusEnum.ACTIVE },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    return answer;
  }

  async findQuestionsByProduct(id: string): Promise<QuestionAnswersEntity[]> {
    const answers = await this.questionAnswersRepository.find({
      where: { question: { id: id }, is_active: ActiveStatusEnum.ACTIVE },
    });
       
    return answers;
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<QuestionAnswersEntity> {
    const answer = await this.findOne(id);

    answer.is_active = ActiveStatusEnum.INACTIVE;
    answer.updated_by = jwtPayload.id;
    answer.updated_user_name = jwtPayload.userName;
    answer.updated_at = new Date();

    return await this.questionAnswersRepository.save(answer);
  }
}
