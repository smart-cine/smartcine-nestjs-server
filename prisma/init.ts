import {
  PrismaClient,
  AccountRole,
  CommentType,
  PerformTranslateType,
  PerformViewType,
  RatingType,
  CinemaProviderPermission,
  WalletType,
} from '@prisma/client';
import { randomBytes, randomInt } from 'crypto';
import { faker } from '@faker-js/faker';
import { hash } from 'src/utils/hash';
import { genId } from 'src/shared/genId';

const client = new PrismaClient({
  log: [
    // {
    //   emit: 'event',
    //   level: 'query',
    // },
  ],
});

// client.$on('query', async (e) => {
//   console.log(`${e.query} ${e.params}`);
// });

client
  .$connect()
  .then(async () => {
    console.log('Connected to the database');
    // create account

    console.log('Creating account');
    const userId = genId();
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

    console.log('Creating business');
    const businessId = genId();
    const business = await client.account.create({
      data: {
        id: businessId,
        email: 'business@gmail.com',
        password: await hash('business'),
        role: AccountRole.BUSINESS,
        name: faker.internet.displayName(),
        business_account: {
          create: {},
        },
      },
    });

    console.log('Creating cinema provider');
    const cinemaProviders = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.cinemaProvider.create({
          data: {
            id: genId(),
            name: faker.company.name(),
            logo_url: faker.image.url(),
            background_url: faker.image.url(),
            banks: {
              create: {
                id: genId(),
                type: WalletType.VNPAY,
                data: {
                  vnpay: {
                    merchant: 'merchant',
                  },
                },
              },
            },
          },
        }),
      ),
    );

    const providerAdmin =
      cinemaProviders[randomInt(0, cinemaProviders.length)].id;
    await client.cinemaProviderOnBusinessAccount.create({
      data: {
        business_account: {
          connect: { id: businessId },
        },
        cinema_provider: {
          connect: {
            id: providerAdmin,
          },
        },
        permission: CinemaProviderPermission.ADMIN,
      },
    });
    console.log('admin', providerAdmin);

    console.log('Creating film');
    const films = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.film.create({
          data: {
            id: genId(),
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

    console.log('Creating cinema');
    const cinemas = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.cinema.create({
          data: {
            id: genId(),
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

    const cinema_layouts = await Promise.all(
      Array.from({ length: 10 }).map(async () => {
        const layout_id = genId();
        const rows = randomInt(5, 15);
        const columns = randomInt(5, 10);

        const layout = await client.cinemaLayout.create({
          data: {
            id: layout_id,
            provider: {
              connect: {
                id: cinemaProviders[randomInt(0, cinemaProviders.length)].id,
              },
            },
            rows,
            columns,
          },
        });

        const grouptypes = [
          'Ghế thường',
          'Ghế VIP',
          'Ghế đôi',
          'Vùng trung tâm',
        ];
        const groups = await Promise.all(
          Array.from({ length: 4 }).map(() =>
            client.cinemaLayoutGroup.create({
              data: {
                id: genId(),
                layout: {
                  connect: {
                    id: layout_id,
                  },
                },
                name: grouptypes.pop()!,
                color: faker.helpers.rangeToNumber({ min: 0, max: 255 }),
                price: faker.finance.amount({
                  min: 10000,
                  max: 100000,
                }),
              },
            }),
          ),
        );

        const seats = await Promise.all(
          Array.from({ length: columns * rows }).map((_, i) => {
            const available = Boolean(
              faker.helpers.rangeToNumber({ min: 0, max: 1 }),
            );
            if (!available) return null;
            return client.cinemaLayoutSeat.create({
              data: {
                id: genId(),
                layout: {
                  connect: {
                    id: layout_id,
                  },
                },
                group: {
                  connect: {
                    id: groups[randomInt(0, groups.length)].id,
                  },
                },
                x: i % columns,
                y: Math.floor(i / columns),
                code: `${String.fromCharCode(65 + Math.floor(i / columns))}${(i % columns) + 1}`,
              },
            });
          }),
        );

        return layout;
      }),
    );

    console.log('Creating cinema room');
    const rooms = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.cinemaRoom.create({
          data: {
            id: genId(),
            cinema: {
              connect: { id: cinemas[randomInt(0, cinemas.length)].id },
            },
            layout: {
              connect: {
                id: cinema_layouts[randomInt(0, cinema_layouts.length)].id,
              },
            },
            name: faker.company.name(),
          },
        }),
      ),
    );

    console.log('Creating comment');
    const comment = await Promise.all(
      Array.from({ length: 100 }).map(async (_, i) =>
        client.comment.create({
          data: {
            id: genId(),
            account: {
              connect: { id: userId },
            },
            dest_film: {
              connect: { id: films[i].id },
            },
            body: faker.lorem.paragraph(),
            type: CommentType.FILM,
          },
        }),
      ),
    );

    console.log('Creating item');
    const item = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.item.create({
          data: {
            id: genId(),
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

    console.log('Creating perform');
    const perform = await Promise.all(
      Array.from({ length: 100 }).map(async () =>
        client.perform.create({
          data: {
            id: genId(),
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

    console.log('Creating rating');
    const rating = await Promise.all(
      Array.from({ length: 100 }).map(async (_, index) =>
        client.rating.create({
          data: {
            id: genId(),
            account: {
              connect: { id: userId },
            },
            dest_film: {
              connect: { id: films[index].id },
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

    console.log('Creating tag');
    const tags = (
      await Promise.allSettled(
        Array.from({ length: 100 }).map(async () =>
          client.tag.create({
            data: {
              name: faker.lorem.word(),
            },
          }),
        ),
      )
    )
      .filter((x) => x.status === 'fulfilled')
      .map((x) => x.value);

    console.log('Creating film tag');
    const film_tag = await Promise.allSettled(
      Array.from({ length: 100 }).map(async () =>
        client.filmsOnTags.create({
          data: {
            film_id: films[randomInt(0, films.length)].id,
            tag_id: tags[randomInt(0, tags.length)].name,
          },
        }),
      ),
    );

    console.log('Done!');
  })
  .catch(console.error)
  .then(console.log);
