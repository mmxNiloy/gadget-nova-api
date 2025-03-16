import { ApiProperty } from '@nestjs/swagger';
import { PaginationOrderEnum } from 'src/common/enums/pagination.enum';

export abstract class ApiQueryPaginationBaseDTO {
  @ApiProperty({
    description: 'page number',
    minimum: 1,
    default: 1,
    required: false,
    type: Number,
  })
  page: number;

  @ApiProperty({
    description: 'data limit',
    minimum: 1,
    default: 10,
    required: false,
    type: Number,
  })
  limit: number;

  @ApiProperty({
    description: 'sort field',
    default: 'createAt',
    required: false,
  })
  sort: string;

  @ApiProperty({
    description: 'order sort',
    required: false,
    default: 'DESC',
    enum: PaginationOrderEnum,
  })
  order: PaginationOrderEnum;
}
