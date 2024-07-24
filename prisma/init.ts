import { PrismaClient, AccountRole } from '@prisma/client';
import { randomBytes } from 'crypto';
import { faker } from '@faker-js/faker';

const client = new PrismaClient();
// client
//   .$connect()
//   .then(async () => {
//     console.log('Connected to the database');

//     for (let i = 0; i < 7; i++) {
//       var users = await client.userAccount.create({
//         data: {
//           account: {
//             create: {
//               id: randomBytes(16),
//               email: faker.internet.email(),
//               password: faker.internet.password(),
//               role: AccountRole.USER,
//               name: faker.internet.displayName(),
//             },
//           },
//         },
//       });
//     }

//     for (let i = 0; i < 3; i++) {
//       var managers = await client.managerAccount.create({
//         data: {
//           account: {
//             create: {
//               id: randomBytes(16),
//               email: faker.internet.email(),
//               password: faker.internet.password(),
//               role: AccountRole.MANAGER,
//               name: faker.internet.displayName(),
//             },
//           },
//         },
//       });
//     }

//     const b = await client.film.create({
//       data: {
//         id: randomBytes(16),
//         manager: {
//           connect: { id: managers.id },
//         },
//         cinema_provider: {
//           connect: { id:  },
//         },
//         title: 'Gru: Kẻ Cướp Mặt Trăng 4',
//         director: 'Chris Renaud, Patrick Delage',
//         background_url: '/film_background/1.jpg',
//         country: 'Việt Nam',
//         // tags: ['Hài', 'Hoạt hình', 'Phiêu lưu'],
//         duration: 94,
//         release_date: new Date('05/07/2024'),
//         language: 'vi',
//         restrict_age: 0,
//         picture_url: '/film_picture/1.jpg',
//         trailer_url: 'https://youtu.be/GTupBD8M3yw',
//         description:
//           'Tiếp nối những sự kiện trong phần ba Despicable Me 3 (2017), giờ đây Gru đã hoàn lương, hạn chế tham gia các hoạt động phi pháp. Ngoài vợ Lucy Wilde và các cô con gái nuôi Margo, Edith, Agnes, giờ đây gia đình Gru còn đón thêm thành viên mới là nhóc tì Gru Junior - con trai đầu lòng của anh. Tuy nhiên, sự an toàn của gia đình Gru nhanh chóng bị đe dọa khi kẻ thù cũ của anh là Maxime Le Mal đã trốn khỏi nhà tù, hắn lên kế hoạch trả thù và thanh toán nợ cũ với Gru. Đồng hành với Maxime còn có người yêu Valentina của gã. Do đó, Gru buộc phải đứng lên đối mặt với kẻ thù để bảo vệ gia đình và các Minions.',
//       },
//     });

//     console.log('b', b);
//   })
//   .catch(console.error)
//   .then(console.log);
