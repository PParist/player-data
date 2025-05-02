import { Test, TestingModule } from '@nestjs/testing';
import { MessageQueueController } from './message_queue.controller';
import { MessageQueueService } from './message_queue.service';

describe('MessageQueueController', () => {
  let controller: MessageQueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageQueueController],
      providers: [MessageQueueService],
    }).compile();

    controller = module.get<MessageQueueController>(MessageQueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
