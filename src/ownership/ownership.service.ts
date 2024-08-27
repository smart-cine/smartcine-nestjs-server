import { binaryToUuid } from 'src/utils/uuid';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BusinessRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnershipService {
  private hierarchies: Array<Map<string, number>> = [];
  private priority: number = 1;

  constructor(private prismaService: PrismaService) {
    this.buildRoles([
      BusinessRole.PROVIDER_ADMIN,
      BusinessRole.PROVIDER_MANAGER,
      BusinessRole.CINEMA_ADMIN,
      BusinessRole.CINEMA_MANAGER,
      BusinessRole.CINEMA_STAFF,
    ]);
  }

  private buildRoles(roles: BusinessRole[]) {
    const hierarchy: Map<string, number> = new Map();
    roles.forEach((role) => {
      hierarchy.set(role, this.priority);
      this.priority++;
    });
    this.hierarchies.push(hierarchy);
  }

  public isAuthorized({
    currentRole,
    requiredRole,
  }: {
    currentRole: BusinessRole;
    requiredRole: BusinessRole;
  }) {
    for (let hierarchy of this.hierarchies) {
      const priority = hierarchy.get(currentRole);
      const requiredPriority = hierarchy.get(requiredRole);
      if (priority && requiredPriority && priority >= requiredPriority) {
        return true;
      }
    }
    return false;
  }

  async accountHasAccess(item_id: Buffer, account_id: Buffer) {
    const ownership = await this.prismaService.ownership.findUniqueOrThrow({
      where: {
        owner_id: account_id,
      },
      select: {
        item_id: true,
      },
    });

    // check if the item_id is the same as the ownership.item_id
    if (item_id.equals(ownership.item_id)) {
      return true;
    }

    // Nested query to find the parent_id of the item_id
    const checkLoop = new Set<string>();
    let current_id = item_id;

    while (true) {
      const query = await this.prismaService.ownershipTree.findUnique({
        where: {
          item_id: current_id,
        },
        select: {
          parent_id: true,
        },
      });

      if (!query) {
        return false;
      }

      // loop detect
      const id_str = binaryToUuid(current_id);
      if (checkLoop.has(id_str)) {
        console.error('Ownertree: loop detected', id_str);
        break;
      }
      checkLoop.add(id_str);

      // check if the current parent_id is the root
      if (query.parent_id.equals(ownership.item_id)) {
        return true;
      }

      current_id = query.parent_id;
    }

    return false;
  }

  async checkAccountHasAccess(item_id: Buffer, account_id: Buffer) {
    const hasAccess = await this.accountHasAccess(item_id, account_id);
    if (!hasAccess) {
      throw new UnauthorizedException('Permission denied');
    }
  }

  // Check if item_id is descendant of parent_id
  async isDescendantOf(item_id: Buffer, parent_id: Buffer) {
    // check if the item_id is the same as the ownership.item_id
    if (item_id.equals(parent_id)) {
      return true;
    }

    // Nested query to find the parent_id of the item_id
    const checkLoop = new Set<string>();
    let current_id = item_id;

    while (true) {
      console.log('current_id', binaryToUuid(current_id));
      const query = await this.prismaService.ownershipTree.findUnique({
        where: {
          item_id: current_id,
        },
        select: {
          parent_id: true,
        },
      });
      if (!query) {
        return false;
      }

      // loop detect
      const id_str = binaryToUuid(current_id);
      if (checkLoop.has(id_str)) {
        console.error('Ownertree: loop detected', id_str);
        break;
      }
      checkLoop.add(id_str);

      // check if the current parent_id is the root
      if (query.parent_id.equals(parent_id)) {
        return true;
      }

      current_id = query.parent_id;
    }

    return false;
  }

  async checkIsDescendantOf(item_id: Buffer, parent_id: Buffer) {
    const isDescendant = await this.isDescendantOf(item_id, parent_id);
    if (!isDescendant) {
      throw new UnauthorizedException('Permission denied');
    }
  }

  async createItem(func: () => Promise<TOwnershipNode | TOwnershipNode[]>) {
    const result = await func();
    await this.prismaService.ownershipTree.createMany({
      data: Array.isArray(result) ? result : [result],
    });
  }

  async deleteItem(func: () => Promise<Buffer | Buffer[]>) {
    const result = await func();
    await this.prismaService.ownershipTree.deleteMany({
      where: {
        item_id: {
          in: Array.isArray(result) ? result : [result],
        },
      },
    });
  }
}

type TOwnershipNode = {
  item_id: Buffer;
  parent_id: Buffer;
};
