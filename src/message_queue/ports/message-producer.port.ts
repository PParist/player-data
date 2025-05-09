export interface MessageProducerPort {
  /**
   * ส่ง message ไปยัง queue หรือ topic
   * @param destination ชื่อ queue/topic
   * @param message เนื้อหาของ message
   * @param options ตัวเลือกเพิ่มเติม
   */
  sendMessage<T>(
    destination: string,
    message: T,
    options?: MessageOptions,
  ): Promise<MessageResponse>;

  /**
   * ส่ง messages หลาย message พร้อมกัน
   * @param destination ชื่อ queue/topic
   * @param messages รายการ messages
   */
  sendBatch<T>(
    destination: string,
    messages: BatchMessage<T>[],
  ): Promise<BatchMessageResponse[]>;
}

export interface MessageOptions {
  // common options that work across message brokers
  delay?: number; // delay in seconds
  priority?: number; // message priority
  groupId?: string; // FIFO/partitioning
  deduplicationId?: string; // for deduplication
  headers?: Record<string, string>; // message headers/attributes
  persistent?: boolean; // should message persist after broker restart
}

export interface MessageResponse {
  id: string;
  timestamp?: Date;
}

export interface BatchMessage<T> {
  id: string;
  payload: T;
  options?: MessageOptions;
}

export interface BatchMessageResponse {
  id: string;
  success: boolean;
  messageId?: string;
  error?: Error;
}
