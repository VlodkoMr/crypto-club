<template>
  <div class="chat-block">
    <Chat v-if="visible"
          :participants="participants"
          :myself="myself"
          :messages="messages"
          :chat-title="chatTitle"
          :placeholder="placeholder"
          :colors="colors"
          :border-style="borderStyle"
          :hide-close-button="hideCloseButton"
          :submit-icon-size="submitIconSize"
          :submit-image-icon-size="submitImageIconSize"
          :load-more-messages="toLoad.length > 0 ? loadMoreMessages : null"
          :async-mode="asyncMode"
          :scroll-bottom="scrollBottom"
          :display-header="displayHeader"
          :send-images="false"
          :profile-picture-config="profilePictureConfig"
          :timestamp-config="timestampConfig"
          @onMessageSubmit="onMessageSubmit"
          @onType="onType"/>
  </div>
</template>

<script>
import {Chat} from 'vue-quick-chat';
import 'vue-quick-chat/dist/vue-quick-chat.css';

export default {
  name: 'ChatApp',
  data() {
    return {
      visible: true,
      participants: [
        {
          name: 'Arnaldo',
          id: 1,
          profilePicture: this.userImage(3)
        },
        {
          name: 'José',
          id: 2,
          profilePicture: this.userImage(2)
        }
      ],
      myself: {
        name: 'Matheus S.',
        id: 3,
        profilePicture: this.userImage(1)
      },
      messages: [
        {
          content: 'received messages',
          myself: false,
          participantId: 1,
          timestamp: {year: 2019, month: 3, day: 5, hour: 20, minute: 10, second: 3, millisecond: 123},
          type: 'text'
        },
        {
          content: 'sent messages',
          myself: true,
          participantId: 3,
          timestamp: {year: 2019, month: 4, day: 5, hour: 19, minute: 10, second: 3, millisecond: 123},
          type: 'text'
        },
        {
          content: 'other received messages',
          myself: false,
          participantId: 2,
          timestamp: {year: 2019, month: 5, day: 5, hour: 10, minute: 10, second: 3, millisecond: 123},
          type: 'text'
        }
      ],
      chatTitle: 'Club of Crypto Lovers',
      placeholder: 'send your message',
      colors: {
        header: {
          bg: '#d30303',
          text: '#fff'
        },
        message: {
          myself: {
            bg: '#fff',
            text: '#555'
          },
          others: {
            bg: '#626262',
            text: '#fff'
          },
          messagesDisplay: {
            bg: 'rgba(255,255,255,.2)'
          }
        },
        submitIcon: '#b91010',
        submitImageIcon: '#b91010',
      },
      borderStyle: {
        topLeft: "3px",
        topRight: "3px",
        bottomLeft: "3px",
        bottomRight: "3px",
      },
      hideCloseButton: true,
      submitImageIconSize: 25,
      submitIconSize: 25,
      asyncMode: false,
      toLoad: [
        {
          content: 'Hey, John Doe! How are you today?',
          myself: false,
          participantId: 2,
          timestamp: {year: 2011, month: 3, day: 5, hour: 10, minute: 10, second: 3, millisecond: 123},
          uploaded: true,
          viewed: true,
          type: 'text'
        },
        {
          content: "Hey, Adam! I'm feeling really fine this evening.",
          myself: true,
          participantId: 3,
          timestamp: {year: 2010, month: 0, day: 5, hour: 19, minute: 10, second: 3, millisecond: 123},
          uploaded: true,
          viewed: true,
          type: 'text'
        },
      ],
      scrollBottom: {
        messageSent: true,
        messageReceived: true
      },
      displayHeader: false,
      profilePictureConfig: {
        others: true,
        myself: true,
        styles: {
          width: '34px',
          height: '34px',
          borderRadius: '50%'
        }
      },
      timestampConfig: {
        format: 'HH:mm',
        relative: false
      },
    }
  },
  methods: {
    userImage(userHash) {
      return `https://avatars.dicebear.com/api/jdenticon/${userHash}.svg?radius=30&width=30&height=30`;
    },
    onType: function (event) {
      //here you can set any behavior
    },
    loadMoreMessages(resolve) {
      setTimeout(() => {
        resolve(this.toLoad); //We end the loading state and add the messages
        //Make sure the loaded messages are also added to our local messages copy or they will be lost
        this.messages.unshift(...this.toLoad);
        this.toLoad = [];
      }, 1000);
    },
    onMessageSubmit: function (message) {
      /*
      * example simulating an upload callback.
      * It's important to notice that even when your message wasn't send
      * yet to the server you have to add the message into the array
      */
      this.messages.push(message);

      /*
      * you can update message state after the server response
      */
      // timeout simulating the request
      setTimeout(() => {
        message.uploaded = true
      }, 2000)
    },
  },
  components: {
    Chat
  },
}
</script>

<style lang="scss">

.chat-block {
  height: 520px !important;
}

.quick-chat-container {
  background: rgba(255, 255, 255, .1);
  border: 1px solid #000;
}

.participant-thumb {
  background: #FFF;
  border: 1px solid #eee;
  border-radius: 50%;
  display: inline-block;
  padding: 2px;
}

</style>
