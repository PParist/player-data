import { Injectable } from '@nestjs/common';
import { CreateMessageQueueDto } from './dto/create-message_queue.dto';
import { UpdateMessageQueueDto } from './dto/update-message_queue.dto';

@Injectable()
export class MessageQueueService {
  create(createMessageQueueDto: CreateMessageQueueDto) {
    return 'This action adds a new messageQueue';
  }

  findAll() {
    return `This action returns all messageQueue`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messageQueue`;
  }

  update(id: number, updateMessageQueueDto: UpdateMessageQueueDto) {
    return `This action updates a #${id} messageQueue`;
  }

  remove(id: number) {
    return `This action removes a #${id} messageQueue`;
  }
}
