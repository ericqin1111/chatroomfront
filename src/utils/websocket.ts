// src/utils/websocket.ts
import type { SendData, FormattedMessageData } from '@/stores/chat'; // 导入类型

export class WebSocketService {
  private url: string;
  private ws: WebSocket | null;
  private reconnectDelay: number;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null;
  private decoder: TextDecoder;

  // 公共回调函数属性
  public onmessage: ((data: FormattedMessageData) => void) | null = null;
  public onopen: (() => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((error: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    this.ws = null;
    this.reconnectDelay = 5000;
    this.heartbeatTimer = null;
    this.decoder = new TextDecoder('utf-8');
    console.log('WebSocketService constructor called.');
    this.connect();
  }

  connect(): void {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED && this.ws.readyState !== WebSocket.CLOSING) {
      console.warn("WebSocket is already connecting or open.");
      return;
    }
    console.log(`Attempting WS connection to ${this.url}`);
    try {
        this.ws = new WebSocket(this.url);
    } catch (e) {
        console.error("Failed to create WebSocket:", e);
        this.handleClose(null); // Trigger reconnect logic perhaps
        return;
    }


    this.ws.onopen = () => {
      console.log('WebSocket 连接已建立');
      // 可以在这里启动心跳
      // this.startHeartbeat();
      if (this.onopen) this.onopen();
    };

    this.ws.onmessage = async (event: MessageEvent) => {
      if (!(event.data instanceof Blob)) {
        console.warn('收到非二进制消息，忽略处理:', event.data);
        return;
      }
      try {
        const buffer: ArrayBuffer = await this.blobToArrayBuffer(event.data);
        if (buffer.byteLength === 0) return; // Ignore empty buffers

        const view = new DataView(buffer);
        const messageType = view.getUint8(0);
        // console.log(`Received message with type byte: ${messageType}`); // Debug raw type

        if (messageType === 1) { // 心跳响应 (假设服务器会发心跳响应或请求?)
          this.handleHeartbeat(); // 可能是重置计时器等
          console.log("Received heartbeat pong/ping?");
        } else if ([2, 3, 4, 5].includes(messageType)) { // 已知的数据包类型
          this.handleDataPacket(buffer, messageType);
        } else {
            console.warn("Received unknown message type:", messageType);
        }
      } catch (error) {
        console.error('消息处理错误:', error);
      }
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.handleClose(event);
    };

    this.ws.onerror = (event: Event) => {
      console.error('WebSocket 错误:', event);
      if (this.onerror) this.onerror(event);
      // onerror 之后通常会触发 onclose
    };
  }

  private handleClose(event: CloseEvent | null) {
      console.log(`WebSocket 连接断开: Code=${event?.code}, Reason=${event?.reason || 'N/A'}. 尝试重连...`);
      this.ws = null;
      if (this.onclose) this.onclose(event as CloseEvent); // Pass event if available
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      // 避免无限重连，可能需要添加重试次数限制
      setTimeout(() => this.connect(), this.reconnectDelay);
  }


  private blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => resolve(event.target?.result as ArrayBuffer);
      reader.onerror = (event: ProgressEvent<FileReader>) => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
  }

  // 假设的心跳处理逻辑，例如重置一个“上次收到 pong”的时间戳
  private handleHeartbeat(): void {
     // console.log("Processing heartbeat response...");
     // this.lastPongTime = Date.now(); // Example
     // 作为响应方，可能只需要发送响应
     this.sendHeartbeatResponse();
  }

  // 发送心跳响应 (Type 1)
  private sendHeartbeatResponse(): void {
    if (this.isConnected()) {
      const buffer = new ArrayBuffer(1);
      const view = new DataView(buffer);
      view.setUint8(0, 1); // 心跳响应类型
      this.ws!.send(buffer);
    }
  }

  // 处理收到的数据包 (Types 2, 3, 4, 5)
  private handleDataPacket(data: ArrayBuffer, messageType: number): void {
    if (data.byteLength <= 1) {
        console.warn("Received data packet too short.");
        return;
    }
    try {
      const jsonBytes = new Uint8Array(data, 1); // 跳过第一个字节
      const rawJsonData = this.decoder.decode(jsonBytes);
      const jsonData = JSON.parse(rawJsonData);
      // console.log('Parsed jsonData:', jsonData);

      // 格式化数据 - **需要确保 jsonData 里的字段存在且类型正确！**
      // 建议添加校验或使用更安全的访问方式
      let formatData: Partial<FormattedMessageData> = {};

      if (messageType === 2) { // 好友文本
          formatData = {
              messageId: jsonData.messId, senderId: Number(jsonData.from), // 假设 from 是数字 ID
              content: jsonData.content, sentTime: jsonData.time, contentType: 1
          };
      } else if (messageType === 4) { // 好友文件
          formatData = {
              messageId: jsonData.messId, senderId: Number(jsonData.from),
              content: jsonData.fileName, sentTime: jsonData.time, contentType: 2,
              // 假设后端也传了这些
              fileName: jsonData.fileName, fileSize: jsonData.fileSize, fileUrl: jsonData.fileUrl
          };
      } else if (messageType === 3) { // 群组文本
          formatData = {
              messageId: jsonData.messId, senderId: Number(jsonData.from), groupId: Number(jsonData.target), // target 是群 ID
              content: jsonData.content, sentTime: jsonData.time, contentType: 1
          };
      } else if (messageType === 5) { // 群组文件
          formatData = {
              messageId: jsonData.messId, senderId: Number(jsonData.from), groupId: Number(jsonData.target),
              content: jsonData.fileName, sentTime: jsonData.time, contentType: 2,
              fileName: jsonData.fileName, fileSize: jsonData.fileSize, fileUrl: jsonData.fileUrl
          };
      } else {
          console.warn("Unknown data packet type in handleDataPacket:", messageType);
          return;
      }

      // 调用外部设置的回调函数
      if (this.onmessage) {
          // 在调用回调前，最好确保 formatData 结构完整符合 FormattedMessageData
          this.onmessage(formatData as FormattedMessageData);
      } else {
          console.warn("WebSocketService: onmessage handler not set, received message ignored.", formatData);
      }

    } catch (error) {
      console.error('处理数据包错误 (JSON 解析或格式化):', error);
    }
  }

  // --- 公共发送方法 ---
  private sendPackedData(messageType: number, data: object): boolean {
     if (!this.isConnected()) {
        console.error("WebSocket not connected. Cannot send data.");
        return false;
     }
     try {
        const jsonString = JSON.stringify(data);
        const jsonBytes = new TextEncoder().encode(jsonString);
        const buffer = new ArrayBuffer(1 + jsonBytes.length);
        const view = new DataView(buffer);
        view.setUint8(0, messageType); // 设置消息类型字节
        new Uint8Array(buffer, 1).set(jsonBytes);
        this.ws!.send(buffer); // 使用非空断言
        console.log(`Sent message type ${messageType} with data:`, data);
        return true;
     } catch (error) {
        console.error(`发送类型 ${messageType} 数据错误:`, error);
        return false;
     }
  }

  sendMessageToFriend(data: SendData): boolean {
    return this.sendPackedData(2, data); // Type 2
  }

  sendMessageToGroup(data: SendData): boolean {
    return this.sendPackedData(3, data); // Type 3
  }

  async sendFileToFriend(data: SendData, file: File): Promise<boolean> {
    if (!this.isConnected()) {
       console.error("WebSocket not connected. Cannot send file.");
       return false;
    }
    try {
      const fileBuffer = await file.arrayBuffer();
      const meta = { ...data, fileName: file.name, fileType: file.type, fileSize: file.size };
      const metaJsonStr = JSON.stringify(meta);
      const metaJsonBytes = new TextEncoder().encode(metaJsonStr);
      const totalLength = 1 + 4 + metaJsonBytes.length + fileBuffer.byteLength;
      const buffer = new ArrayBuffer(totalLength);
      const view = new DataView(buffer);
      let offset = 0;
      view.setUint8(offset, 4); offset += 1; // Type 4
      view.setUint32(offset, metaJsonBytes.length); offset += 4; // JSON length
      new Uint8Array(buffer, offset, metaJsonBytes.length).set(metaJsonBytes); offset += metaJsonBytes.length;
      new Uint8Array(buffer, offset).set(new Uint8Array(fileBuffer));
      this.ws!.send(buffer);
      console.log(`Sent file ${file.name} to friend ${data.target}`);
      return true;
    } catch (error) {
      console.error('发送好友文件错误:', error);
      return false;
    }
  }

  async sendFileToGroup(data: SendData, file: File): Promise<boolean> {
     if (!this.isConnected()) {
       console.error("WebSocket not connected. Cannot send file.");
       return false;
    }
    try {
      const fileBuffer = await file.arrayBuffer();
      const meta = { ...data, fileName: file.name, fileType: file.type, fileSize: file.size };
      const metaJsonStr = JSON.stringify(meta);
      const metaJsonBytes = new TextEncoder().encode(metaJsonStr);
      const totalLength = 1 + 4 + metaJsonBytes.length + fileBuffer.byteLength;
      const buffer = new ArrayBuffer(totalLength);
      const view = new DataView(buffer);
      let offset = 0;
      view.setUint8(offset, 5); offset += 1; // Type 5
      view.setUint32(offset, metaJsonBytes.length); offset += 4; // JSON length
      new Uint8Array(buffer, offset, metaJsonBytes.length).set(metaJsonBytes); offset += metaJsonBytes.length;
      new Uint8Array(buffer, offset).set(new Uint8Array(fileBuffer));
      this.ws!.send(buffer);
       console.log(`Sent file ${file.name} to group ${data.target}`);
      return true;
    } catch (error) {
      console.error('发送群组文件错误:', error);
      return false;
    }
  }

  close(code?: number, reason?: string): void {
    if (this.ws) {
      // Prevent automatic reconnect attempts when manually closing
      // One way is to temporarily disable the reconnect logic in handleClose
      // Or set a flag that handleClose checks
      console.log(`Manually closing WebSocket connection... Code=${code}, Reason=${reason}`);
      this.reconnectDelay = Infinity; // Stop reconnection temporarily
      this.ws.close(code, reason);
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.ws = null; // Clear instance after closing
    }
  }

  isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}