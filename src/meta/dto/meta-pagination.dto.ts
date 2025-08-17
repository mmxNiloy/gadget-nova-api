import { PickType } from '@nestjs/swagger';
import { PaginationDTO } from 'src/common/dtos/pagination/pagination.dto';

export class MetaPaginationDTO extends PickType(PaginationDTO, [
  'limit',
  'page',
]) {}
