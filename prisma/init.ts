import bcrypt from 'bcrypt';
import { PaymentController } from './../src/payment/payment.controller';
import {
  PrismaClient,
  AccountRole,
  CommentType,
  PerformTranslateType,
  PerformViewType,
  RatingType,
  WalletType,
  BusinessRole,
  Prisma,
  FeatureFlag,
  PaymentStatus,
} from '@prisma/client';
import { randomBytes, randomInt } from 'crypto';
import { fa, faker, ro } from '@faker-js/faker';
// import { hash } from 'src/utils/hash';
import { genId } from 'src/shared/genId';
import { ModelName } from '@casl/prisma/dist/types/prismaClientBoundTypes';
import { DefaultArgs } from '@prisma/client/runtime/library';
import moment from 'moment';

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

function createWithOwnershipTree<
  ModelName extends Prisma.TypeMap['meta']['modelProps'],
>(
  model: ModelName,
  treeData: {
    parent_id: Buffer;
    child_id: Buffer;
  },
) {
  // @ts-ignore
  client[model].createMany({
    data: [{}],
  });
}

const hash = async (password: string) => bcrypt.hash(password, 10);

client
  .$connect()
  .then(async () => {
    console.time('init database');
    console.time('Creating account');
    await init(client);
  })
  .catch(console.error)
  .then(console.log);

async function init(prisma: PrismaClient) {
  const userId = genId();
  const user = await prisma.account.create({
    data: {
      id: userId,
      email: 'user@gmail.com',
      password: await hash('user'),
      role: AccountRole.USER,
      name: faker.internet.displayName(),
      avatar_url: faker.image.avatar(),
      user_account: {
        create: {},
      },
    },
  });

  // await prisma.account.createMany({
  //   data: Array.from({ length: 100 }).map(() => ({
  //     id: genId(),
  //     email: faker.internet.email(),
  //     password: bcrypt.hashSync('user', 10),
  //     role: AccountRole.USER,
  //     name: faker.internet.userName(),
  //   })),
  // });
  const userIds = Array.from({ length: 100 }).map(() => genId());
  await prisma.account.createMany({
    data: userIds.map((id) => ({
      id,
      email: faker.internet.email(),
      password: bcrypt.hashSync('user', 10),
      role: AccountRole.USER,
      name: faker.internet.userName(),
      avatar_url: faker.image.avatar(),
    })),
  });
  await prisma.userAccount.createMany({
    data: userIds.map((id) => ({
      id,
    })),
  });

  const users = await prisma.userAccount.findMany({
    include: {
      account: true,
    },
  });
  console.timeEnd('Creating account');

  console.time('Creating business');
  const businessId = genId();
  const business = await prisma.account.create({
    data: {
      id: businessId,
      email: 'business@gmail.com',
      password: await hash('business'),
      role: AccountRole.BUSINESS,
      name: faker.internet.displayName(),
      avatar_url: faker.image.avatar(),
      business_account: {
        create: {},
      },
    },
  });
  console.timeEnd('Creating business');

  console.time('Creating cinema provider');
  const cinemaProviders = (
    await Promise.allSettled(
      Array.from({ length: 20 }).map(async () => {
        const name = faker.company.name();
        return prisma.cinemaProvider.create({
          data: {
            id: genId(),
            name: name,
            logo_url: faker.image.url(),
            background_url: faker.image.url(),
            country: faker.location.countryCode(),
            banks: {
              createMany: {
                data: Array.from({ length: 3 }).map(() => ({
                  id: genId(),
                  type: WalletType.VNPAY,
                  data: {
                    vnp_TmnCode: 'E6T2KFD0',
                    vnp_SecureHash: 'E454D25V72H2G6HSFP9B0PWG3LCVWMJQ',
                  },
                })),
              },
            },
            cinemas: {
              createMany: {
                data: Array.from({ length: 3 }).map(() => ({
                  id: genId(),
                  name: `${name} ${faker.company.name()}`,
                  address: faker.location.streetAddress(),
                })),
              },
            },
          },
          include: {
            banks: true,
          },
        });
      }),
    )
  )
    .filter((x) => x.status === 'fulfilled')
    .map((x) => x.value);
  console.timeEnd('Creating cinema provider');

  const cinemas = await prisma.cinema.findMany({
    include: {
      provider: {
        include: {
          banks: true,
        },
      },
    },
  });

  // check conflict ids in cinemas
  const cinemaIds = cinemas.map((x) => x.id);
  const uniqueCinemaIds = new Set(cinemaIds);
  if (uniqueCinemaIds.size !== cinemaIds.length) {
    throw new Error('Cinema ids conflict');
  }

  console.time('Creating provider admin');
  const providerAdminID =
    cinemaProviders[randomInt(0, cinemaProviders.length)].id;
  await prisma.ownership.create({
    data: {
      owner_id: businessId,
      item_id: providerAdminID,
      role: BusinessRole.PROVIDER_ADMIN,
    },
  });
  console.timeEnd('Creating provider admin');

  console.time('Creating film');
  // const films = await Promise.all(
  //   Array.from({ length: 100 }).map(async () => {
  //     const provider_id =
  //       cinemaProviders[randomInt(0, cinemaProviders.length)].id;
  //     const id = genId();

  //     return prisma.film.create({
  //       data: {
  //         id: id,
  //         cinema_provider_id:
  //           cinemaProviders[randomInt(0, cinemaProviders.length)].id,
  //         title: faker.lorem.words({ min: 1, max: 3 }),
  //         director: faker.lorem.words({ min: 1, max: 2 }),
  //         background_url: faker.image.url(),
  //         country: faker.location.countryCode(),
  //         duration: randomInt(60, 180),
  //         release_date: faker.date.past(),
  //         language: faker.location.countryCode(),
  //         restrict_age: faker.helpers.rangeToNumber({ min: 3, max: 18 }),
  //         picture_url: faker.image.url(),
  //         trailer_url: 'https://youtu.be/GTupBD8M3yw',
  //         description: faker.lorem.paragraph(),
  //       },
  //     });
  //   }),
  // );
  await prisma.film.createMany({
    data: cinemaProviders
      .map((provider) =>
        Array.from({ length: 3 }).map(() => ({
          id: genId(),
          cinema_provider_id: provider.id,
          title: faker.lorem.words({ min: 1, max: 3 }),
          director: faker.lorem.words({ min: 1, max: 2 }),
          background_url: faker.image.url(),
          country: faker.location.countryCode(),
          duration: randomInt(60, 180),
          release_date: faker.date.past(),
          language: faker.location.countryCode(),
          restrict_age: faker.helpers.rangeToNumber({ min: 3, max: 18 }),
          picture_url: faker.image.url(),
          trailer_url: 'https://youtu.be/GTupBD8M3yw',
          description: faker.lorem.paragraph(),
        })),
      )
      .flat(),
  });
  const films = await prisma.film.findMany();

  console.timeEnd('Creating film');

  console.time('Creating cinema bank');
  await prisma.businessBankOnCinema.createMany({
    data: cinemas.map((cinema) => ({
      cinema_id: cinema.id,
      business_bank_id: cinema.provider.banks[0].id,
      type: cinema.provider.banks[0].type,
    })),
  });
  console.timeEnd('Creating cinema bank');

  console.time('Creating cinema room');
  await prisma.cinemaRoom.createMany({
    data: cinemas
      .map((cinema) =>
        Array.from({ length: 3 }).map(() => ({
          id: genId(),
          cinema_id: cinema.id,
          name: faker.company.name(),
        })),
      )
      .flat(),
  });
  const rooms = await prisma.cinemaRoom.findMany();
  console.timeEnd('Creating cinema room');

  console.time('Creating cinema layouts');
  let provider_index = 0;
  const cinema_layouts = await Promise.all(
    Array.from({ length: 100 }).map(async (_, index) => {
      const layout_id = genId();
      const rows = randomInt(5, 15);
      const columns = randomInt(5, 10);
      provider_index++;
      if (provider_index >= cinemaProviders.length) provider_index = 0;

      await prisma.cinemaLayout.createMany({
        data: {
          id: layout_id,
          cinema_provider_id: cinemaProviders[provider_index].id,
          cinema_room_id: index == 0 ? undefined : rooms[index].id,
          rows,
          columns,
        },
      });

      const grouptypes = ['Ghế thường', 'Ghế VIP', 'Ghế đôi', 'Vùng trung tâm'];
      const groups = Array.from({ length: 4 }).map(() => ({
        id: genId(),
        cinema_layout_id: layout_id,
        name: grouptypes.pop()!,
        color: faker.helpers.rangeToNumber({ min: 0, max: 255 }),
        price: faker.finance.amount({
          min: 10000,
          max: 100000,
        }),
      }));
      await prisma.cinemaLayoutGroup.createMany({
        data: groups,
      });

      // const seats = await Promise.all(
      //   Array.from({ length: columns * rows }).map((_, i) => {
      //     const available = Boolean(
      //       faker.helpers.rangeToNumber({ min: 0, max: 1 }),
      //     );
      //     if (!available) return null;
      //     return prisma.cinemaLayoutSeat.create({
      //       data: {
      //         id: genId(),
      //         layout: {
      //           connect: {
      //             id: layout_id,
      //           },
      //         },
      //         group: {
      //           connect: {
      //             id: groups[randomInt(0, groups.length)].id,
      //           },
      //         },
      //         x: i % columns,
      //         y: Math.floor(i / columns),
      //         code: `${String.fromCharCode(65 + Math.floor(i / columns))}${(i % columns) + 1}`,
      //       },
      //     });
      //   }),
      // );
      const seats = Array.from({ length: columns * rows })
        .map((_, i) => {
          const available = Boolean(
            faker.helpers.rangeToNumber({ min: 0, max: 1 }),
          );
          if (!available) return null;
          return {
            id: genId(),
            cinema_layout_id: layout_id,
            group_id: groups[randomInt(0, groups.length)].id,
            x: i % columns,
            y: Math.floor(i / columns),
            code: `${String.fromCharCode(65 + Math.floor(i / columns))}${(i % columns) + 1}`,
          };
        })
        .filter((x) => x) as {
        id: Buffer;
        cinema_layout_id: Buffer;
        group_id: Buffer;
        x: number;
        y: number;
        code: string;
      }[];
      await prisma.cinemaLayoutSeat.createMany({
        data: seats,
      });

      return {
        id: layout_id,
        cinema_provider_id: cinemaProviders[provider_index].id,
        cinema_room_id: index == 0 ? undefined : rooms[index].id,
        rows,
        columns,
        groups: groups,
        seats: seats,
      };
    }),
  );
  console.timeEnd('Creating cinema layouts');

  console.time('Creating comments');
  await prisma.comment.createMany({
    data: films
      .map((film) =>
        Array.from({ length: 20 }).map((_, index) => ({
          id: genId(),
          account_id: users[index].id,
          dest_film_id: film.id,
          body: faker.lorem.paragraph(),
          type: CommentType.FILM,
        })),
      )
      .flat(),
  });

  await prisma.comment.createMany({
    data: cinemaProviders
      .map((provider, index) =>
        Array.from({ length: 20 }).map((_, i) => ({
          id: genId(),
          account_id: users[i].id,
          dest_cinema_provider_id: provider.id,
          body: faker.lorem.paragraph(),
          type: CommentType.CINEMA_PROVIDER,
        })),
      )
      .flat(),
  });

  const comments = await prisma.comment.findMany();

  // CommentType.COMMENT
  await prisma.comment.createMany({
    data: comments
      .map((comment, index) =>
        Array.from({ length: 2 }).map((_, i) => ({
          id: genId(),
          account_id: users[i].id,
          dest_comment_id: comment.id,
          body: faker.lorem.paragraph(),
          type: CommentType.COMMENT,
        })),
      )
      .flat(),
  });

  console.timeEnd('Creating comments');

  console.time('Creating item');
  await prisma.item.createMany({
    data: cinemas
      .map((cinema, index) =>
        Array.from({ length: 10 }).map(() => ({
          id: genId(),
          cinema_id: cinema.id,
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
        })),
      )
      .flat(),
  });
  const items = await prisma.item.findMany();
  console.timeEnd('Creating item');

  console.time('Creating perform');
  // await Promise.allSettled(
  //   rooms.map((room) => {
  //     return Promise.allSettled(
  //       Array.from({ length: 100 }).map(async () => {
  //         const start = moment().add(randomInt(0, 10), 'days');
  //         const film = films[randomInt(0, films.length)];

  //         return prisma.perform.create({
  //           data: {
  //             id: genId(),
  //             film_id: film.id,
  //             cinema_room_id: room.id,
  //             start_time: start.toDate(),
  //             end_time: start.add(film.duration, 'minutes').toDate(),
  //             translate_type: faker.helpers.enumValue(PerformTranslateType),
  //             view_type: faker.helpers.enumValue(PerformViewType),
  //             price: faker.finance.amount({
  //               min: 10000,
  //               max: 100000,
  //             }),
  //           },
  //         });
  //       }),
  //     );
  //   }),
  // );


  await prisma.perform.createMany({
    data: films
      .map((film) =>
        rooms.map((room) => {
          return Array.from({ length: 10 }).map(() => {
            const start = moment().add(randomInt(0, 10), 'days');
            return {
              id: genId(),
              film_id: film.id,
              cinema_room_id: room.id,
              start_time: start.toDate(),
              end_time: start.add(film.duration, 'minutes').toDate(),
              translate_type: faker.helpers.enumValue(PerformTranslateType),
              view_type: faker.helpers.enumValue(PerformViewType),
              price: faker.finance.amount({
                min: 10000,
                max: 100000,
              }),
            };
          });
        }),
      )
      .flat(2),
  });

  const performs = await prisma.perform.findMany();

  console.timeEnd('Creating perform');

  console.time('Creating payment');
  const banks = await prisma.businessBank.findMany();
  // const payments = await Promise.all(
  //   Array.from({ length: 100 }).map(async (_, index) =>
  //     prisma.payment.create({
  //       data: {
  //         id: genId(),
  //         account_id: userId,
  //         perform_id: performs[index].id,
  //         business_bank_id: banks[randomInt(0, banks.length)].id,
  //         type: WalletType.VNPAY,
  //         data: {
  //           vnpay: {
  //             merchant: 'merchant',
  //           },
  //         },
  //         date_expired: faker.date.future(),
  //         status: PaymentStatus.PENDING,
  //       },
  //     }),
  //   ),
  // );
  console.timeEnd('Creating payment');

  console.time('Creating rating');

  await prisma.rating.createMany({
    data: films
      .map((film) =>
        Array.from({ length: randomInt(10, 30) }).map((_, index) => ({
          id: genId(),
          account_id: users[index].id,
          dest_film_id: film.id,
          type: RatingType.FILM,
          score:
            faker.helpers.rangeToNumber({
              min: 0,
              max: 10,
            }) / 10,
        })),
      )
      .flat(),
  });

  // CINEMA_PROVIDER
  await prisma.rating.createMany({
    data: cinemaProviders
      .map((provider, index) =>
        Array.from({ length: randomInt(10, 30) }).map((_, i) => ({
          id: genId(),
          account_id: users[i].id,
          dest_cinema_provider_id: provider.id,
          type: RatingType.CINEMA_PROVIDER,
          score:
            faker.helpers.rangeToNumber({
              min: 0,
              max: 10,
            }) / 10,
        })),
      )
      .flat(),
  });

  await prisma.rating.createMany({
    data: comments
      .map((comment, index) =>
        Array.from({ length: randomInt(1, 10) }).map((_, i) => ({
          id: genId(),
          account_id: users[i].id,
          dest_comment_id: comment.id,
          type: RatingType.COMMENT,
          score:
            faker.helpers.rangeToNumber({
              min: 0,
              max: 10,
            }) / 10,
        })),
      )
      .flat(),
  });

  console.timeEnd('Creating rating');

  console.time('Creating tag');
  const tags = (
    await Promise.allSettled(
      Array.from({ length: 100 }).map(async () =>
        prisma.tag.create({
          data: {
            name: faker.lorem.word(),
          },
        }),
      ),
    )
  )
    .filter((x) => x.status === 'fulfilled')
    .map((x) => x.value);
  console.timeEnd('Creating tag');

  console.time('Creating pickseat');
  await prisma.pickseat.createMany({
    data: Array.from({ length: 100 }).map((_, index) => ({
      id: genId(),
      account_id: userId,
      perform_id: performs[index].id,
      layout_seat_id:
        cinema_layouts[index].seats[
          randomInt(0, cinema_layouts[index].seats.length)
        ].id,
    })),
  });
  console.timeEnd('Creating pickseat');

  console.time('Creating film tag');
  await prisma.filmsOnTags.createMany({
    data: films
      .map((film) =>
        Array.from({ length: randomInt(2, 6) }).map(() => ({
          film_id: film.id,
          tag_id: tags[randomInt(0, tags.length)].name,
        })),
      )
      .flat(),
    skipDuplicates: true,
  });

  console.timeEnd('Creating film tag');

  console.time('building ownership tree');
  await prisma.ownershipTree.createMany({
    data: films.map((item) => ({
      item_id: item.id,
      parent_id: item.cinema_provider_id,
    })),
  });
  await prisma.ownershipTree.createMany({
    data: cinemas.map((item) => ({
      item_id: item.id,
      parent_id: item.cinema_provider_id,
    })),
  });
  await prisma.ownershipTree.createMany({
    data: cinema_layouts.map((item) => ({
      item_id: item.id,
      parent_id: item.cinema_room_id //! If cinema_room_id is undefined, it will belong to cinema_provider_id else it will belong to cinema_room_id
        ? item.cinema_room_id
        : item.cinema_provider_id,
    })),
  });
  const layoutGroups = await prisma.cinemaLayoutGroup.findMany();
  await prisma.ownershipTree.createMany({
    data: layoutGroups.map((item) => ({
      item_id: item.id,
      parent_id: item.cinema_layout_id,
    })),
  });
  const layoutSeats = await prisma.cinemaLayoutSeat.findMany();
  await prisma.ownershipTree.createMany({
    data: layoutSeats.map((item) => ({
      item_id: item.id,
      parent_id: item.cinema_layout_id,
    })),
  });
  await prisma.ownershipTree.createMany({
    data: rooms.map((item) => ({
      item_id: item.id,
      parent_id: item.cinema_id,
    })),
  });
  await prisma.ownershipTree.createMany({
    data: performs.map((item) => ({
      item_id: item.id,
      parent_id: item.cinema_room_id,
    })),
  });
  await prisma.ownershipTree.createMany({
    data: items.map((item) => ({
      item_id: item.id,
      parent_id: item.cinema_id,
    })),
  });
  await prisma.ownershipTree.createMany({
    data: banks.map((item) => ({
      item_id: item.id,
      parent_id: item.cinema_provider_id,
    })),
  });
  console.timeEnd('building ownership tree');

  console.time('creating role to feature');
  const staffCinema = [
    FeatureFlag.UPDATE_CINEMA_ROOM,
    FeatureFlag.UPDATE_CINEMA_LAYOUT,
    FeatureFlag.UPDATE_CINEMA_LAYOUT_SEAT,
    FeatureFlag.UPDATE_CINEMA_LAYOUT_GROUP,
    FeatureFlag.CREATE_PERFORM,
    FeatureFlag.UPDATE_PERFORM,
    FeatureFlag.DELETE_PERFORM,
    FeatureFlag.UPDATE_ITEM,
  ];

  const managerCinema = [
    ...staffCinema,
    FeatureFlag.UPDATE_CINEMA,
    FeatureFlag.CREATE_CINEMA_ROOM,
    FeatureFlag.DELETE_CINEMA_ROOM,
    FeatureFlag.CREATE_CINEMA_LAYOUT_GROUP,
    FeatureFlag.DELETE_CINEMA_LAYOUT_GROUP,
    FeatureFlag.CREATE_CINEMA_LAYOUT_SEAT,
    FeatureFlag.DELETE_CINEMA_LAYOUT_SEAT,
    FeatureFlag.CREATE_ITEM,
    FeatureFlag.DELETE_ITEM,
  ];

  const managerProvider = [
    ...managerCinema,
    FeatureFlag.UPDATE_CINEMA_PROVIDER,
    FeatureFlag.CREATE_CINEMA,
    FeatureFlag.DELETE_CINEMA,
    FeatureFlag.CREATE_CINEMA_LAYOUT,
    FeatureFlag.CLONE_CINEMA_LAYOUT,
    FeatureFlag.DELETE_CINEMA_LAYOUT,
    FeatureFlag.CREATE_FILM,
    FeatureFlag.UPDATE_FILM,
    FeatureFlag.DELETE_FILM,
    FeatureFlag.ADD_TAG,
    FeatureFlag.REMOVE_TAG,
  ];

  const adminProvider = [
    ...managerProvider,
    FeatureFlag.DELETE_CINEMA_PROVIDER,
  ];

  await prisma.roleToFeature.createMany({
    data: [
      ...staffCinema.map((feature) => ({
        role: BusinessRole.CINEMA_STAFF,
        feature: feature,
      })),
      ...managerCinema.map((feature) => ({
        role: BusinessRole.CINEMA_MANAGER,
        feature: feature,
      })),
      ...managerProvider.map((feature) => ({
        role: BusinessRole.PROVIDER_MANAGER,
        feature: feature,
      })),
      ...adminProvider.map((feature) => ({
        role: BusinessRole.PROVIDER_ADMIN,
        feature: feature,
      })),
    ],
  });
  console.timeEnd('creating role to feature');

  console.log('Done!');
  console.timeEnd('init database');
}
