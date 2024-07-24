export class SuccessRes<Data = any> {
  success = true;
  data: Data;
  constructor(data: Data) {
    this.data = data;
  }
}

export type SuccessPaginationRes<Item> = SuccessRes<Item[]> & {
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
};
