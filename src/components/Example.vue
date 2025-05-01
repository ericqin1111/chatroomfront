<template>
  <div>
    <button @click="sendMessage">发送测试消息</button>

  <div v-if="this.$ws?.state?.data != null" >
    {{ this.$ws.state.data }}
  </div>
</div>
</template>

<script>


export default {
  data() {
    return {
      wsService: null
    };
  },

  methods: {
    sendMessage() {
      this.$ws.send({ type: 'test', data: 'Hello' });
          console.log(this.$ws.data)
    }
  }
};


</script>
