import { Module } from '@nestjs/common';
import { MessageQueueService } from './message_queue.service';
import { MessageQueueController } from './message_queue.controller';

@Module({
  controllers: [MessageQueueController],
  providers: [MessageQueueService],
})
export class MessageQueueModule {}
