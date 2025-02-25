import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductQuestionsEntity } from './product-questions.entity';

@Entity('question-answers')
export class QuestionAnswersEntity extends CustomBaseEntity {
  @Column({ name: 'question', type: 'text', nullable: true })
  answer: string;

  @ManyToOne(() => ProductQuestionsEntity, (productQuestions) => productQuestions.answer, {
    eager: true,
  })
  @JoinColumn({ name: 'question_id' })
  question: ProductQuestionsEntity;
}
