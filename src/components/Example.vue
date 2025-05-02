<template>
  <div>
    <button @click="sendMessage">发送测试消息</button>

  <div v-if="this.$ws?.state?.data != null" >
    {{ this.$ws.state.data }}
  </div>
    <img  src="http://localhost:8080/file/20250502171842_9083_327c6e88.png" style="max-width: 300px;"/>
    {{ messages }}
  <div>
    <input type="file" @change="sendFile" />
  </div>
</div>
</template>

<script>

import { messageMap } from '@/utils/messageStore';


export default {
  props: ['type', 'target'],
  computed: {
    messages() {
      const key = 'friend-2';
      console.log('read the key=' + key)
      return messageMap[key] || [];
    }
  },
  data() {
    return {
      form:{
        'target': '1',
        'content': 'test',
      }

    };
  },

  methods: {
    async sendMessage() {
      console.log('you send a data')
      await this.$ws.sendMessageToFriend(this.form)

    },
    sendFile(event){

      const file = event.target.files[0];
      console.log('file changed:' + file.name)
      if (!file) return;
      console.log('ready send:' + this.$ws.sendFileToFriend)

      this.$ws.sendFileToGroup(this.form, file)
      console.log('send over')
    }

  }
};


</script>
