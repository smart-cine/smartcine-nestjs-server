export type TResponse<T> = {
  success: boolean;
  error_key?: string;
  message: string;
  data: T;
};

export type TResponsePagination<T> = TResponse<T> & {
  paging: {
    total: number;
    limit: number;

    page?: number;
    next_page?: number;

    cursor?: string;
    next_cursor?: string;
    prev_cursor?: string;
  };
};
