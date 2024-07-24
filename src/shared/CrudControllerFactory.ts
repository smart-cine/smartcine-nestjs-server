// import {
//   ArgumentMetadata,
//   Body,
//   Delete,
//   Get,
//   Injectable,
//   Param,
//   Patch,
//   Post,
//   Query,
//   Type,
//   UsePipes,
//   ValidationPipe,
//   ValidationPipeOptions,
// } from '@nestjs/common';
// import { IsNumber } from 'class-validator';
// import { IdDto } from './id.dto'

// @Injectable()
// export class AbstractValidationPipe extends ValidationPipe {
//   constructor(
//     options: ValidationPipeOptions,
//     private readonly targetTypes: { body?: Type; query?: Type; param?: Type },
//   ) {
//     super(options);
//   }

//   async transform(value: any, metadata: ArgumentMetadata) {
//     const targetType = this.targetTypes[metadata.type];
//     if (!targetType) {
//       return super.transform(value, metadata);
//     }
//     return super.transform(value, { ...metadata, metatype: targetType });
//   }
// }

// export function ControllerFactory<T, C, U, Q>(
//   idDto: Type<T>,
//   createDto: Type<C>,
//   queryDto: Type<Q>,
//   updateDto: Type<U>,
// ): ClassType<ICrudController<T, C, U, Q>> {
//   const createPipe = new AbstractValidationPipe(
//     { whitelist: true, transform: true },
//     { body: createDto },
//   );
//   const updatePipe = new AbstractValidationPipe(
//     { whitelist: true, transform: true },
//     { body: updateDto },
//   );
//   const queryPipe = new AbstractValidationPipe(
//     { whitelist: true, transform: true },
//     { query: queryDto },
//   );

//   class CrudController<T, C, U, Q> implements ICrudController<T, C, U, Q> {
//     protected service: ICrudService<T, C, U, Q>;

//     @Post()
//     @UsePipes(createPipe)
//     async create(@Body() body: C): Promise<T> {
//       return this.service.createItem(body);
//     }

//     @Get(':id')
//     getOne(@Param() params: IdDto): Promise<T> {
//       return this.service.getItem(params.id);
//     }

//     @Get()
//     @UsePipes(queryPipe)
//     get(@Query() query: Q): Promise<T[]> {
//       return this.service.getItems(query);
//     }

//     @Delete(':id')
//     delete(@Param() params: IdDto): Promise<Partial<T>> {
//       return this.service.deleteItem(params.id);
//     }

//     @Patch(':id')
//     @UsePipes(updatePipe)
//     update(@Param('id') params: IdDto, @Body() body: U): Promise<T> {
//       return this.service.updateItem(params.id, body);
//     }
//   }

//   return CrudController;
// }

// export interface ICrudController<EntityType, CreateDto, UpdateDto, QueryDto> {
//   getOne(id: IdDto): Promise<EntityType>;

//   get(query: QueryDto): Promise<EntityType[]>;

//   create(body: CreateDto): Promise<EntityType>;

//   update(params: IdDto, body: UpdateDto): Promise<EntityType>;

//   delete(id: IdDto): Promise<Partial<EntityType>>;
// }

// export interface ICrudService<EntityType, CreateDto, UpdateDto, QueryDto> {
//   getItem(id: number): Promise<EntityType>;

//   getItems(query: QueryDto): Promise<EntityType[]>;

//   createItem(body: CreateDto): Promise<EntityType>;

//   updateItem(id: number, body: UpdateDto): Promise<EntityType>;

//   deleteItem(id: number): Promise<Partial<EntityType>>;
// }

// export interface ClassType<T> extends Function {
//   new (...args: any[]): T;
// }
