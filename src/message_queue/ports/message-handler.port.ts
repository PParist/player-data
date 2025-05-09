// import { MessageMetadata } from './message-consumer.port';

// /**
//  * MessageHandlerPort กำหนดรูปแบบของ handlers ที่ประมวลผล messages
//  * ช่วยให้แยก business logic ออกจาก infrastructure
//  */
// export interface MessageHandlerPort<T = any> {
//   /**
//    * ประมวลผล message
//    * @param message เนื้อหาของ message
//    * @param metadata ข้อมูลเพิ่มเติมเกี่ยวกับ message
//    * @returns Promise<void> หรือ boolean เพื่อระบุว่าประมวลผลสำเร็จหรือไม่
//    */
//   handle(message: T, metadata: MessageMetadata): Promise<boolean | void>;

//   /**
//    * ตรวจสอบว่า handler นี้สามารถจัดการกับ message ประเภทนี้ได้หรือไม่
//    * @param message เนื้อหาของ message
//    * @param metadata ข้อมูลเพิ่มเติมเกี่ยวกับ message
//    * @returns boolean ระบุว่า handler นี้สามารถจัดการกับ message นี้ได้หรือไม่
//    */
//   canHandle(message: T, metadata: MessageMetadata): boolean;

//   /**
//    * จัดการกับ error ที่เกิดขึ้นระหว่างการประมวลผล message
//    * @param message เนื้อหาของ message
//    * @param metadata ข้อมูลเพิ่มเติมเกี่ยวกับ message
//    * @param error error ที่เกิดขึ้น
//    * @returns boolean ระบุว่าควรลอง process ซ้ำหรือไม่
//    */
//   handleError?(
//     message: T,
//     metadata: MessageMetadata,
//     error: Error,
//   ): Promise<boolean>;

//   /**
//    * เรียกเมื่อ message ประมวลผลสำเร็จ
//    * @param message เนื้อหาของ message
//    * @param metadata ข้อมูลเพิ่มเติมเกี่ยวกับ message
//    */
//   onSuccess?(message: T, metadata: MessageMetadata): Promise<void>;
// }

// /**
//  * Factory interface สำหรับสร้าง handlers ตามประเภทของ message
//  */
// export interface MessageHandlerFactory {
//   /**
//    * สร้าง handler ที่เหมาะสมสำหรับ message
//    * @param message เนื้อหาของ message
//    * @param metadata ข้อมูลเพิ่มเติมเกี่ยวกับ message
//    * @returns MessageHandlerPort ที่เหมาะสม หรือ undefined ถ้าไม่มี handler ที่เหมาะสม
//    */
//   createHandler<T>(
//     message: T,
//     metadata: MessageMetadata,
//   ): MessageHandlerPort<T> | undefined;
// }

// /**
//  * Abstract class ที่ implement MessageHandlerPort บางส่วน
//  * ช่วยลดการเขียนโค้ดซ้ำซ้อนสำหรับ handlers
//  */
// export abstract class BaseMessageHandler<T> implements MessageHandlerPort<T> {
//   /**
//    * ประเภทของ messages ที่ handler นี้สามารถจัดการได้
//    */
//   protected abstract readonly supportedTypes: string[];

//   /**
//    * ตรวจสอบว่า handler นี้สามารถจัดการกับ message ประเภทนี้ได้หรือไม่
//    */
//   canHandle(message: any, metadata: MessageMetadata): boolean {
//     // ถ้า message มี property 'type' ตรวจสอบว่าอยู่ใน supportedTypes หรือไม่
//     if (message && message.type) {
//       return this.supportedTypes.includes(message.type);
//     }

//     // ถ้า message ไม่มี property 'type' ตรวจสอบจาก metadata หรือรูปแบบอื่น
//     // เช่น routing key, headers ฯลฯ
//     return false;
//   }

//   /**
//    * ประมวลผล message (ต้อง implement โดย concrete classes)
//    */
//   abstract handle(
//     message: T,
//     metadata: MessageMetadata,
//   ): Promise<boolean | void>;

//   /**
//    * จัดการกับ error ที่เกิดขึ้นระหว่างการประมวลผล message
//    * ค่าเริ่มต้นคือ retry อีกครั้ง (return true)
//    */
//   async handleError(
//     message: T,
//     metadata: MessageMetadata,
//     error: Error,
//   ): Promise<boolean> {
//     console.error(`Error handling message ${metadata.id}: ${error.message}`);
//     // ค่าเริ่มต้นคือ retry = true
//     return true;
//   }

//   /**
//    * เรียกเมื่อ message ประมวลผลสำเร็จ
//    */
//   async onSuccess(message: T, metadata: MessageMetadata): Promise<void> {
//     console.log(`Successfully processed message ${metadata.id}`);
//   }
// }

// /**
//  * Registry สำหรับเก็บ handlers ทั้งหมด
//  */
// export class MessageHandlerRegistry implements MessageHandlerFactory {
//   private handlers: MessageHandlerPort[] = [];

//   /**
//    * เพิ่ม handler เข้าไปใน registry
//    */
//   registerHandler(handler: MessageHandlerPort): void {
//     this.handlers.push(handler);
//   }

//   /**
//    * สร้าง handler ที่เหมาะสมสำหรับ message
//    */
//   createHandler<T>(
//     message: T,
//     metadata: MessageMetadata,
//   ): MessageHandlerPort<T> | undefined {
//     for (const handler of this.handlers) {
//       if (handler.canHandle(message, metadata)) {
//         return handler as MessageHandlerPort<T>;
//       }
//     }
//     return undefined;
//   }
// }
