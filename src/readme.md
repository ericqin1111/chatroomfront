

对于websocket的注释：

1。websocket的统一入口为this.$ws

2.只有在登录后websocket功能才可以启用

3.用websocket向好友发送文字消息调用 this.$ws.sendMessageToFriend(this.form)。
this.form的格式:{'target': 发送到的好友的id（不是用户名）,
                  'content': 要发送的文字消息,}


4.用websocket向好友发送文件调用 this.$ws.sendFileToFriend(this.form，file)。
this.form的格式:{'target': 发送到的好友的id（不是用户名）,
                  'content': 可不需要,}
file是你上传的文件对象
下面一个是例子：
<input type="file" @change="sendFile" />
 sendFile(event){

      const file = event.target.files[0];
      console.log('file changed:' + file.name)
      if (!file) return;
      console.log('ready send:' + this.$ws.sendFileToFriend)

      this.$ws.sendFileToFriend(this.form, file)
      console.log('send over')
    }


5.用websocket向群组发送文字消息调用 this.$ws.sendMessageToGroup(this.form)。
this.form的格式:{'target': 发送到的群组的id（不是群名）,
                  'content': 要发送的文字消息,}


6.用websocket向群组发送文件调用 this.$ws.sendFileToFriend(this.form，file)。
this.form的格式:{'target': 发送到的群组的id（不是群名）,
                  'content': 可不需要,}
file是你上传的文件对象
下面一个是例子：
<input type="file" @change="sendFile" />
 sendFile(event){

      const file = event.target.files[0];
      console.log('file changed:' + file.name)
      if (!file) return;
      console.log('ready send:' + this.$ws.sendFileToFriend)

      this.$ws.sendFileToGroup(this.form, file)
      console.log('send over')
    }


7.关于如何获取websocket传回的消息：
         首先在需要相应数据的组件引入：import { messageMap } from '@/utils/messageStore';

         然后在export default里写  props: ['type', 'target'],
                                    computed: {
                                    messages() {
                                    const key = `${this.type}-${this.target}`;
                                    console.log('read the key=' + key)
                                    return messageMap[key] || [];
                                    }
                                    },
         
         之后通过父组件对子组件的赋值给组件里的type与target赋值（props的属性，不会不要问我，自己去查）
         其中type只能有两种值,一种是'friend',在页面是指向好友聊天时使用，另一种是'group'，在页面指向群聊时使用
         而target属性则是表示对应的好友或群组id
         如       'group-1'就是id为1的群组的聊天窗口
                  'friend-2'就是编号为2的好友聊天窗口
         如果在页面里想要使用相应的数据，我这只提供如何获得全部的聊天消息，剩下的自己探索:
         {{messages}}

8.关于数据元的差异：
         在好友聊天窗口中，messages里的数据元是类似{ "messageId": "117", "senderId": "2", "content": "test", "sentTime": "2025-05-02T19:33:48.840", "contentType": 1 }的格式，基本与java数据库代码一致，contentType为1时表示文字消息，2表示文件消息，messageId表示消息从第一个往下的序数

         在群聊窗口 messages里的数据元是类似{ "messageId": "229", "senderId": "2", "groupId": "1", "content": "test", "sentTime": "2025-05-02T20:00:27.585", "contentType": 1 }
         除了多了一个groupid没什么不同

9.文件的获取，因为后端只会返回给你文件名，你需要自行设置标签来获取资源，譬如说获取某个图片这样写
<img  src="http://localhost:8080/file/返回给你的文件名" style="max-width: 300px;"/>


10.如果你的http代码要像websocket一样在全局变量里存储相应的数据
先
import { messageMap } from '@/utils/messageStore';
再
if (!messageMap[key]) messageMap[key] = [];
      console.log(messageMap)
      messageMap[key].push(formatData); // 响应式
关于key的格式见第七点
formatData是集合，最好参照第8点的格式