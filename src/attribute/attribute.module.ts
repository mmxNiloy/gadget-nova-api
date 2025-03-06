import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeGroupController } from './attribute-group/attribute-group/attribute-group.controller';
import { AttributeGroupService } from './attribute-group/attribute-group/attribute-group.service';
import { AttributeGroupEntity } from './attribute-group/entities/attribute-group.entity';
import { AttributeValueEntity } from './attribute-group/entities/attribute-value.entity';
import { AttributeValueController } from './attribute-value/attribute-value.controller';
import { AttributeValueService } from './attribute-value/attribute-value.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttributeGroupEntity, AttributeValueEntity]),
  ],
  controllers: [AttributeGroupController, AttributeValueController],
  providers: [AttributeGroupService, AttributeValueService],
  exports: [AttributeValueService],
})
export class AttributeModule {}
