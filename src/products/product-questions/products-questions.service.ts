import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { Repository } from 'typeorm';
import { CreateProductQuestionsDto } from '../dto/create-product-questions.dto';
import { ProductQuestionsEntity } from '../entities/product-questions.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ProductsQuestionsService {
  constructor(
    @InjectRepository(ProductQuestionsEntity)
    private readonly productQuestionRepository: Repository<ProductQuestionsEntity>,
    private readonly productsService: ProductsService,
  ) {}

  async create(
    createProductQuestionsDto: CreateProductQuestionsDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductQuestionsEntity> {
    try {
      const product = await this.productsService.findOne(
        createProductQuestionsDto.product_id,
      );

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      delete createProductQuestionsDto.product_id;

      const productQuestionsEntity = this.productQuestionRepository.create({
        ...createProductQuestionsDto,
        product: product,
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
      });

      return await this.productQuestionRepository.save(productQuestionsEntity);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string): Promise<ProductQuestionsEntity> {
    const question = await this.productQuestionRepository.findOne({
      where: { id, is_active: ActiveStatusEnum.ACTIVE },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async findQuestionsByProduct(id: string): Promise<ProductQuestionsEntity[]> {
    const questions = await this.productQuestionRepository.find({
      where: { product: { id: id }, is_active: ActiveStatusEnum.ACTIVE },
    });
       
    return questions;
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductQuestionsEntity> {
    const question = await this.findOne(id);

    question.is_active = ActiveStatusEnum.INACTIVE;
    question.updated_by = jwtPayload.id;
    question.updated_user_name = jwtPayload.userName;
    question.updated_at = new Date();

    return await this.productQuestionRepository.save(question);
  }
}
