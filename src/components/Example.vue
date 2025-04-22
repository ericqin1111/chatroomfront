<template>
  <div>
    <button @click="sendMessage">发送测试消息</button>

  <div v-if="wsService?.state?.data != null" >
    {{ wsService.state.data }}
  </div>
</div>
</template>

<script>
import { WebSocketService } from '@/utils/websocket';

export default {
  data() {
    return {
      wsService: null
    };
  },
  mounted() {
    this.wsService = new WebSocketService('ws://localhost:8080/wsexample');
  },
  beforeDestroy() {
    this.wsService.close();
  },
  methods: {
    sendMessage() {
      this.wsService.send({ type: 'test', data: 'Hello' });
          console.log(this.wsService.data)
    }
  }
};


</script>
