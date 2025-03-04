import { Module } from '@nestjs/common';
import { AttributeGroupController } from './attribute-group/attribute-group/attribute-group.controller';
import { AttributeGroupService } from './attribute-group/attribute-group/attribute-group.service';
import { AttributeValueController } from './attribute-value/attribute-value.controller';
import { AttributeValueService } from './attribute-value/attribute-value.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeGroupEntity } from './attribute-group/entities/attribute-group.entity';
import { AttributeValueEntity } from './attribute-group/entities/attribute-value.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttributeGroupEntity, AttributeValueEntity]),
  ],
  controllers: [AttributeGroupController, AttributeValueController],
  providers: [AttributeGroupService, AttributeValueService],
})
export class AttributeModule {}
