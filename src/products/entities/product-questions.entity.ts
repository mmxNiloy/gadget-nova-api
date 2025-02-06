import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';
import { QuestionAnswersEntity } from './question-answers.entity';

@Entity('products-questions')
export class ProductQuestionsEntity extends CustomBaseEntity {
  @Column({ name: 'question', type: 'text', nullable: true })
  question: string;

  @ManyToOne(() => ProductEntity, (product) => product.questions, {
    eager: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @OneToMany(() => QuestionAnswersEntity, (questionAnswersEntity) => questionAnswersEntity.question)
  answer: QuestionAnswersEntity[];
}
