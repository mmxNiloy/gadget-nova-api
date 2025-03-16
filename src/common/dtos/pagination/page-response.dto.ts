import { PageDto } from './page.dto';

export class PageResponseDto extends PageDto {
  constructor(
    public page: number = 0,
    public limit: number = 10,
    public count: number = 0,
    // eslint-disable-next-line @typescript-eslint/ban-types
    public data: Object = [],
  ) {
    super(page, limit);
  }
}
