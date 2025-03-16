export class PaginationDTO {
  public readonly page: number;
  public readonly limit: number;
  public readonly order: string;
  public readonly sort: string;

  constructor(pagination: {
    page: number;
    limit: number;
    order: string;
    sort: string;
  }) {
    this.page = pagination.page;
    this.limit = pagination.page;
    this.order = pagination.order;
    this.sort = `${pagination.sort}`;
  }
}
