import { binaryToUuid } from 'src/utils/uuid';
import { PaginationQueryDto } from './PaginationQuery.dto';

export function genPaginationResponse({
  items,
  paginationQuery,
  total,
}: {
  items: any[];
  paginationQuery: PaginationQueryDto;
  total: number;
}) {
  const parsedPagination = parsePaginationQuery(paginationQuery);
  const hasNext = items.length > parsedPagination.limit;

  return {
    total,
    limit: parsedPagination.limit,
    next_page:
      !parsedPagination.cursor && hasNext ? parsedPagination.page + 1 : null,
    next_cursor: hasNext ? binaryToUuid(items[items.length - 1 - 1].id) : null,
  };
}

export function generatePaginationParams(paginationQuery: PaginationQueryDto) {
  const parsedPagination = parsePaginationQuery(paginationQuery);
  const searchOrderOptions = {
    orderBy: Object.fromEntries(
      parsedPagination.sort.map((sort) => [sort.field, sort.by]),
    ),
    where: parsedPagination.search.length
      ? {
          OR: parsedPagination.search.map((search) => ({
            [search.field]: {
              contains: search.value,
            },
          })),
        }
      : undefined,
  };

  if (parsedPagination.cursor) {
    return {
      take: parsedPagination.limit + 1,
      skip: 1,
      cursor: {
        id: parsedPagination.cursor,
      },
      ...searchOrderOptions,
    };
  } else {
    return {
      take: parsedPagination.limit + 1,
      skip: (parsedPagination.page - 1) * parsedPagination.limit,
      ...searchOrderOptions,
    };
  }
}

export function parsePaginationQuery(pagination: PaginationQueryDto): {
  page: number;
  cursor?: Buffer;
  limit: number;
  sort: { field: string; by: 'asc' | 'desc' }[];
  search: { field: string; value: string }[];
} {
  return {
    page: pagination.page,
    cursor: pagination.cursor,
    limit: pagination.limit,
    sort: pagination.sort
      ? pagination.sort.split(',').map((sortItem) => {
          const sortBy = sortItem[0];
          switch (sortBy) {
            case '-':
              return {
                field: sortItem.slice(1),
                by: 'asc',
              };
            case '+':
              return {
                field: sortItem.slice(1),
                by: 'asc',
              };
            default:
              return {
                field: sortItem.trim(),
                by: 'desc',
              };
          }
        })
      : [],
    search: pagination.search
      ? pagination.search.split(',').map((searchItem) => {
          const field = searchItem.split(':')[0];
          const value = searchItem.split(':')[1];
          return {
            field,
            value,
          };
        })
      : [],
  };
}
