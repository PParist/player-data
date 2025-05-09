export interface MessageConsumerPort {
  /**
   * เริ่มการรับ messages จาก queue/topic
   * @param destination ชื่อ queue/topic
   * @param handler function สำหรับประมวลผล message
   * @param options ตัวเลือกการ consume
   * @returns ID ของ consumer สำหรับใช้หยุดการทำงาน
   */
  startConsumer<T = any>(
    destination: string,
    handler: MessageHandler<T>,
    options?: ConsumerOptions,
  ): Promise<string>;

  /**
   * หยุดการรับ messages
   * @param consumerId ID ของ consumer
   */
  stopConsumer(consumerId: string): Promise<void>;
}

export type MessageHandler<T = any> = (
  message: T,
  metadata: MessageMetadata,
) => Promise<void>;

export interface MessageMetadata {
  id: string;
  timestamp: Date;
  headers?: Record<string, string>;
  destination: string;
  redelivered?: boolean;
  receivedCount?: number;
  consumerOptions?: ConsumerOptions;
  receiptHandle?: string; // สำหรับ SQS
}

export interface ConsumerOptions {
  concurrency?: number; // จำนวน messages ที่ประมวลผลพร้อมกัน
  prefetchCount?: number; // จำนวน messages ที่ดึงมาครั้งละเท่าไหร่
  visibilityTimeout?: number; // ระยะเวลาที่ message ไม่ visible สำหรับ consumers อื่น
  autoAck?: boolean; // Acknowledge อัตโนมัติหรือไม่
  deadLetterQueue?: string; // Queue สำหรับ messages ที่ประมวลผลไม่สำเร็จ
  retryCount?: number; // จำนวนครั้งที่ retry
  retryDelay?: number; // ระยะเวลาระหว่างการ retry
}
