import { binaryToUuid } from 'src/utils/uuid';
import { PaginationQueryDto } from './PaginationQuery.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export async function genPaginationResponse<
  ModelName extends Prisma.TypeMap['meta']['modelProps'],
>({
  prisma,
  modelName,
  pagination,
  opts = {},
}: {
  prisma: PrismaService;
  modelName: ModelName;
  pagination: PaginationQueryDto;
  opts?: Record<string, any>;
}) {
  const parsedPagination = parsePaginationQuery(pagination);
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
  console.log(JSON.stringify(searchOrderOptions));

  if (!prisma[modelName]) {
    throw new Error(`Model "${modelName}" not found in PrismaService`);
  }

  const items = parsedPagination.cursor
    ? // @ts-ignore
      await prisma[modelName].findMany({
        take: parsedPagination.limit + 1,
        skip: 1,
        cursor: {
          id: parsedPagination.cursor,
        },
        ...searchOrderOptions,
      })
    : // @ts-ignore
      await prisma[modelName].findMany({
        take: parsedPagination.limit + 1,
        skip: (parsedPagination.page - 1) * parsedPagination.limit,
        ...searchOrderOptions,
      });

  // because we fetch 1 more item to check if there is next page
  const hasNext = items.length > parsedPagination.limit;

  return {
    data: items.slice(0, parsedPagination.limit) as Awaited<
      ReturnType<(typeof prisma)[typeof modelName]['findMany']>
    >,
    pagination: {
      // @ts-ignore
      total: await prisma[modelName].count(),
      limit: pagination.limit,
      next_page: !pagination.cursor && hasNext ? pagination.page + 1 : null,
      next_cursor: hasNext
        ? binaryToUuid(items[items.length - 1 - 1].id)
        : null,
      // prev_cursor: binaryToUuid(items[0].id),
    },
  };
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
