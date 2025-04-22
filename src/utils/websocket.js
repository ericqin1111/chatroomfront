
import { reactive } from 'vue'

export class WebSocketService{
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectDelay = 5000; // 重连间隔
    this.heartbeatTimer = null;
    this.lastPongTime = 0;
    this.decoder = new TextDecoder('utf-8');

     // 使用Vue 3的响应式API
     this.state = reactive({
      data: []
    })

    this.connect();






  }

  // 连接WebSocket
  connect() {
    this.ws = new WebSocket(this.url);

    // 连接成功
    this.ws.onopen = () => {
      console.log('WebSocket连接已建立');

    };

    // 接收消息
     this.ws.onmessage = async (ep) => {
      console.log(ep.data)
      if (!(ep.data instanceof Blob)) {
        console.warn('收到非二进制消息，忽略处理')
        return
      }

      try {
        const e = await this.blobToArrayBuffer(ep.data);

        const data = e;
        const view = new DataView(data)

        // 读取第一个字节判断消息类型
        const messageType = view.getUint8(0)

        if (messageType === 1) {
          // 心跳包处理
          this.handleHeartbeat()
        } else if (messageType === 0) {
          // 数据包处理
          this.handleDataPacket(data)
        } else {
          console.warn('未知消息类型:', messageType)
        }
      } catch (error) {
        console.error('消息处理错误:', error)
      }
    };

    // 连接关闭
    this.ws.onclose = (e) => {
      console.log('连接断开，尝试重连...');
      setTimeout(() => this.connect(), this.reconnectDelay);
    };

    // 错误处理
    this.ws.onerror = (err) => {
      console.error('WebSocket错误:', err);
    };




  };

  // Blob转换为ArrayBuffer
  blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsArrayBuffer(blob)
    })
  };

  handleHeartbeat() {
    //回复心跳响应
    this.sendHeartbeatResponse()
  };

  sendHeartbeatResponse() {
    if (!(this.ws.readyState === WebSocket.OPEN)) return

    const buffer = new ArrayBuffer(1)
    const view = new DataView(buffer)
    view.setUint8(0, 1) // 心跳响应

    this.ws.send(buffer)
  };

  handleDataPacket(data) {
    try {
      // 跳过第一个字节（类型标识），解析剩余数据为JSON
      const jsonBytes = new Uint8Array(data, 1)

      const jsonData = this.decoder.decode(jsonBytes);
      this.state.data.push(jsonData);
      console.log('jd： ' + jsonData)

    } catch (error) {
      console.error('JSON解析错误:', error)
    }
  };


  // 发送消息
  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {

      try {
        // 序列化JSON
        const jsonString = JSON.stringify(data)
        const jsonBytes = new TextEncoder().encode(jsonString)

        // 创建缓冲区（1字节类型 + JSON数据）
        const buffer = new ArrayBuffer(1 + jsonBytes.length)
        const view = new DataView(buffer)
        view.setUint8(0, 0) // 业务数据标识

        // 复制JSON数据
        new Uint8Array(buffer, 1).set(jsonBytes)
        console.log('data out');
        // 发送
        this.ws.send(buffer)
        return true
      } catch (error) {
        console.error('发送数据错误:', error)
        return false
      }
    }
  };


  // 关闭连接
  close() {
    this.ws.close();
  };
}
