export interface MessageQueuePort {
  /**
   * ส่ง message เดียวไปยัง queue
   * @param queueName ชื่อ queue
   * @param message ข้อความที่จะส่ง
   * @param options ตัวเลือกเพิ่มเติม
   * @returns Message ID
   */
  sendMessage(
    queueName: string,
    message: any,
    options?: SendMessageOptions,
  ): Promise<string>;

  /**
   * ส่ง messages หลายรายการพร้อมกัน
   * @param queueName ชื่อ queue
   * @param messages รายการข้อความ
   * @returns รายการ Message IDs
   */
  sendBatch(
    queueName: string,
    messages: BatchMessage[],
  ): Promise<BatchSendResult[]>;

  /**
   * รับ messages จาก queue
   * @param queueName ชื่อ queue
   * @param options ตัวเลือกการรับข้อความ
   * @returns รายการ messages ที่ได้รับ
   */
  receiveMessages(
    queueName: string,
    options?: ReceiveMessageOptions,
  ): Promise<QueueMessage[]>;

  /**
   * ลบ message จาก queue
   * @param queueName ชื่อ queue
   * @param receiptHandle Receipt handle ของ message
   */
  deleteMessage(queueName: string, receiptHandle: string): Promise<void>;

  /**
   * ลบ messages หลายรายการพร้อมกัน
   * @param queueName ชื่อ queue
   * @param receiptHandles รายการ receipt handles
   */
  deleteBatch(
    queueName: string,
    receiptHandles: string[],
  ): Promise<BatchDeleteResult[]>;

  /**
   * เปลี่ยนระยะเวลาที่ message จะมองไม่เห็น
   * @param queueName ชื่อ queue
   * @param receiptHandle Receipt handle ของ message
   * @param visibilityTimeout ระยะเวลาใหม่ (วินาที)
   */
  changeMessageVisibility(
    queueName: string,
    receiptHandle: string,
    visibilityTimeout: number,
  ): Promise<void>;

  /**
   * ส่ง message ไปยัง Dead Letter Queue
   * @param queueName ชื่อ queue ต้นทาง
   * @param message ข้อความที่จะส่งไป DLQ
   * @param reason เหตุผลที่ส่งไป DLQ
   */
  sendToDeadLetterQueue?(
    queueName: string,
    message: QueueMessage,
    reason?: string,
  ): Promise<void>;
}

// Supporting interfaces
export interface SendMessageOptions {
  delaySeconds?: number;
  messageAttributes?: Record<string, MessageAttributeValue>;
  messageGroupId?: string; // For FIFO queues
  messageDeduplicationId?: string; // For FIFO queues
}

export interface BatchMessage {
  id: string;
  body: any;
  delaySeconds?: number;
  messageAttributes?: Record<string, MessageAttributeValue>;
  messageGroupId?: string;
  messageDeduplicationId?: string;
}

export interface BatchSendResult {
  id: string;
  messageId?: string;
  error?: Error;
}

export interface ReceiveMessageOptions {
  maxNumberOfMessages?: number;
  visibilityTimeout?: number;
  waitTimeSeconds?: number;
  attributeNames?: string[];
  messageAttributeNames?: string[];
}

export interface QueueMessage {
  messageId: string;
  receiptHandle: string;
  body: any;
  attributes?: Record<string, string>;
  messageAttributes?: Record<string, MessageAttributeValue>;
  md5OfBody?: string;
}

export interface BatchDeleteResult {
  id: string;
  success: boolean;
  error?: Error;
}

export interface MessageAttributeValue {
  dataType: 'String' | 'Number' | 'Binary';
  stringValue?: string;
  binaryValue?: Buffer;
}
