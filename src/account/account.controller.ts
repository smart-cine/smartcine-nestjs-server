import { Body, Controller, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { RegisterAccount } from './dto/RegisterAccount.dto';
import { LoginAccount } from './dto/LoginAccount.dto';
import { Token } from './decorators/Token.decorator';

@Controller('account')
export class AccountController {
  constructor(private service: AccountService) {}

  @Post('register')
  register(@Body() body: RegisterAccount) {
    return this.service.register(body);
  }

  @Post('login')
  login(@Body() body: LoginAccount) {
    return this.service.login(body);
  }

  // @Roles([AccountRole.BUSINESS, AccountRole.USER])
  // @Post('logout')
  // logout(@Token() token: string) {
  //   return this.service.logout(token);
  // }
}
