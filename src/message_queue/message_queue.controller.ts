import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessageQueueService } from './message_queue.service';
import { CreateMessageQueueDto } from './dto/create-message_queue.dto';
import { UpdateMessageQueueDto } from './dto/update-message_queue.dto';

@Controller()
export class MessageQueueController {
  constructor(private readonly messageQueueService: MessageQueueService) {}

  @MessagePattern('createMessageQueue')
  create(@Payload() createMessageQueueDto: CreateMessageQueueDto) {
    return this.messageQueueService.create(createMessageQueueDto);
  }

  @MessagePattern('findAllMessageQueue')
  findAll() {
    return this.messageQueueService.findAll();
  }

  @MessagePattern('findOneMessageQueue')
  findOne(@Payload() id: number) {
    return this.messageQueueService.findOne(id);
  }

  @MessagePattern('updateMessageQueue')
  update(@Payload() updateMessageQueueDto: UpdateMessageQueueDto) {
    return this.messageQueueService.update(updateMessageQueueDto.id, updateMessageQueueDto);
  }

  @MessagePattern('removeMessageQueue')
  remove(@Payload() id: number) {
    return this.messageQueueService.remove(id);
  }
}
