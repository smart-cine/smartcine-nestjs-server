import {
  PrismaClient,
  AccountRole,
  CinemaLayoutType,
  CinemaRoomType,
  CommentType,
  PerformTranslateType,
  PerformViewType,
  RatingType,
} from '@prisma/client';
import { randomBytes, randomInt } from 'crypto';
import { faker } from '@faker-js/faker';
import { hash } from 'src/utils/hash';
import { genId } from 'src/shared/genId';
import { binaryToUuid } from 'src/utils/uuid';

const client = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

client.$on('query', async (e) => {
  console.log(`${e.query} ${e.params}`);
});

client
  .$connect()
  .then(async () => {
    console.log('Connected to the database');
    // create account

    const userId = randomBytes(16);
    const user = await client.account.create({
      data: {
        id: userId,
        email: 'user@gmail.com',
        password: await hash('user'),
        role: AccountRole.USER,
        name: faker.internet.displayName(),
        user_account: {
          create: {},
        },
      },
    });

    const managerId = randomBytes(16);
    const manager = await client.account.create({
      data: {
        id: managerId,
        email: 'manager@gmail.com',
        password: await hash('manager'),
        role: AccountRole.MANAGER,
        name: faker.internet.displayName(),
        manager_account: {
          create: {},
        },
      },
    });

    const cinemaProviders = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.cinemaProvider.create({
          data: {
            id: randomBytes(16),
            name: faker.company.name(),
            logo_url: faker.image.url(),
            background_url: faker.image.url(),
          },
        }),
      ),
    );

    const films = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.film.create({
          data: {
            id: randomBytes(16),
            manager: {
              connect: { id: managerId },
            },
            cinema_provider: {
              connect: {
                id: cinemaProviders[randomInt(0, cinemaProviders.length)].id,
              },
            },
            title: faker.lorem.words({ min: 1, max: 3 }),
            director: faker.lorem.words({ min: 1, max: 2 }),
            background_url: faker.image.url(),
            country: faker.location.countryCode(),
            duration: randomInt(60, 180),
            release_date: faker.date.past(),
            language: faker.location.countryCode(),
            restrict_age: 0,
            picture_url: faker.image.url(),
            trailer_url: 'https://youtu.be/GTupBD8M3yw',
            description: faker.lorem.paragraph(),
          },
        }),
      ),
    );

    const cinemas = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.cinema.create({
          data: {
            id: randomBytes(16),
            provider: {
              connect: {
                id: cinemaProviders[randomInt(0, cinemaProviders.length)].id,
              },
            },
            name: faker.company.name(),
            address: faker.location.secondaryAddress(),
          },
        }),
      ),
    );

    enum SeatType {
      EMPTY = 0,
      NOT_EMTPY = 1,
    }

    const cinema_layouts = await Promise.all(
      Array.from({ length: 100 }).map(async () => {
        const cols = randomInt(5, 15);
        const rows = randomInt(5, 10);
        const groups = Array.from({ length: randomInt(1, 5) }).map(() => ({
          id: binaryToUuid(genId()),
          name: faker.lorem.word(),
          color: faker.internet.color(),
          price: faker.finance.amount({
            min: 10000,
            max: 100000,
          }),
        }));
        const seats = Array.from({ length: cols * rows }).map(() => {
          const type = faker.helpers.enumValue(SeatType);
          return {
            type,
            group_id:
              type === SeatType.NOT_EMTPY
                ? groups[randomInt(0, groups.length)].id
                : null,
          };
        });

        return client.cinemaLayout.create({
          data: {
            id: randomBytes(16),
            manager: {
              connect: { id: manager.id },
            },
            type: CinemaLayoutType.RECTANGLE,
            data: JSON.stringify({
              cols,
              rows,
              groups,
              seats,
            }),
          },
        });
      }),
    );

    const rooms = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.cinemaRoom.create({
          data: {
            id: randomBytes(16),
            cinema: {
              connect: { id: cinemas[randomInt(0, cinemas.length)].id },
            },
            cinema_layout: {
              connect: {
                id: cinema_layouts[randomInt(0, cinema_layouts.length)].id,
              },
            },
            name: faker.company.name(),
            type: faker.helpers.enumValue(CinemaRoomType),
          },
        }),
      ),
    );

    const comment_id = randomBytes(16);
    const comment = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.comment.create({
          data: {
            id: comment_id,
            account: {
              connect: { id: userId },
            },
            dest_film: {
              connect: { id: films[randomInt(0, films.length)].id },
            },
            body: faker.lorem.paragraph(),
            type: CommentType.FILM,
          },
        }),
      ),
    );

    const item = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.item.create({
          data: {
            id: randomBytes(16),
            manager: {
              connect: { id: managerId },
            },
            cinema_provider: {
              connect: {
                id: cinemaProviders[randomInt(0, cinemaProviders.length)].id,
              },
            },
            name: faker.company.name(),
            price: faker.finance.amount({
              min: 10000,
              max: 100000,
            }),
            discount:
              faker.helpers.rangeToNumber({
                min: 0,
                max: 100,
              }) / 100,
          },
        }),
      ),
    );

    const perform = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.perform.create({
          data: {
            id: randomBytes(16),
            manager: {
              connect: { id: managerId },
            },
            film: {
              connect: { id: films[randomInt(0, films.length)].id },
            },
            room: {
              connect: { id: rooms[randomInt(0, rooms.length)].id },
            },
            start_time: faker.date.future(),
            end_time: faker.date.future(),
            translate_type: faker.helpers.enumValue(PerformTranslateType),
            view_type: faker.helpers.enumValue(PerformViewType),
            price: faker.finance.amount({
              min: 10000,
              max: 100000,
            }),
          },
        }),
      ),
    );

    const rating = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.rating.create({
          data: {
            id: randomBytes(16),
            account: {
              connect: { id: userId },
            },
            dest_film: {
              connect: { id: films[randomInt(0, films.length)].id },
            },
            type: RatingType.FILM,
            score:
              faker.helpers.rangeToNumber({
                min: 0,
                max: 10,
              }) / 10,
          },
        }),
      ),
    );

    const tags = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.tag.create({
          data: {
            name: faker.lorem.word(),
          },
        }),
      ),
    );

    const film_tag = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.filmsOnTags.create({
          data: {
            film_id: films[randomInt(0, films.length)].id,
            tag_id: tags[randomInt(0, tags.length)].name,
          },
        }),
      ),
    );
  })
  .catch(console.error)
  .then(console.log);
