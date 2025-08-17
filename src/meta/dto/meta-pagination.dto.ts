import { ApiProperty } from '@nestjs/swagger';

export class MetaPaginationDTO {
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
}
