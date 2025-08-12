import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(
    @Request() { user: { _id: reqId } },
    @Body() createTodoDto: CreateTodoDto,
  ) {
    return this.todosService.create(reqId, createTodoDto);
  }

  @Get()
  findAll(
    @Request() { user: { _id: reqId } },
    @Query() { limit = 10, page = 1, search = '', ...query },
  ) {
    query.user = reqId;
    return this.todosService.findAll(query, limit, page, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}
