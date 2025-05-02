import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageQueueDto } from './create-message_queue.dto';

export class UpdateMessageQueueDto extends PartialType(CreateMessageQueueDto) {
  id: number;
}
