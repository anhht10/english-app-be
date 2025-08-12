import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Todo } from '@/modules/todos/schemas/todo.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  async create(user: string, createTodoDto: CreateTodoDto) {
    const newTodo = await this.todoModel.create({ ...createTodoDto, user });
    return {
      _id: newTodo._id,
    };
  }

  async findAll(query: any, limit: number, page: number, search: string) {
    const { filter, sort, projection } = aqp(query);

    if (!page || isNaN(page)) {
      page = 1;
    }

    if (!limit || isNaN(limit)) {
      limit = 10;
    }

    const todos = await this.todoModel
      .find({
        ...filter,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      })
      .select(projection ?? '-__v')
      .sort(sort as any)
      .limit(limit)
      .skip((page - 1) * limit);

    return todos;
  }

  async findOne(id: string) {
    const todo = await this.todoModel.findById(id);

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto) {
    const update = await this.todoModel.updateOne({ _id: id }, updateTodoDto);
    return update;
  }

  async remove(id: string) {
    const result = await this.todoModel.deleteOne({ _id: id });
    return { deleted: result.deletedCount > 0 };
  }
}
