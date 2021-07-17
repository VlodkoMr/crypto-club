<template>
  <div class="chat-block">
    <Chat v-if="visible"
          :participants="$store.state.chat.participants"
          :load-more-messages="loadMoreMessages"
          :myself="$store.state.chat.myself"
          :messages="$store.state.chat.messages"
          :chat-title="chatTitle"
          :placeholder="placeholder"
          :colors="colors"
          :border-style="borderStyle"
          :hide-close-button="hideCloseButton"
          :submit-icon-size="submitIconSize"
          :submit-image-icon-size="submitImageIconSize"
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

<!--:load-more-messages="toLoad.length > 0 ? loadMoreMessages : null"-->

<script>
import {Chat} from 'vue-quick-chat';
import 'vue-quick-chat/dist/vue-quick-chat.css';

export default {
  name: 'ChatApp',
  data() {
    return {
      visible: false,
      isLoading: true,
      allLoaded: false,
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
  created() {
    this.$store.dispatch('loadChatMessages').then(() => {
      this.visible = true;
      this.isLoading = false;
    });
  },
  methods: {
    onType: function (event) {
      //here you can set any behavior
    },
    loadMoreMessages(resolve) {
      if (this.allLoaded) {
        resolve();
        return;
      }

      if (!this.isLoading) {
        this.isLoading = true;
        const lastId = this.$store.state.chat.messages[0].id;
        this.$store.dispatch('loadChatMessages', lastId).then(messages => {
          if (messages.length < 1) {
            this.allLoaded = true;
          }

          setTimeout(() => {
            const objDiv = document.querySelectorAll('.message-container')[1];
            objDiv.scrollIntoView(true);

            resolve(messages);
            this.isLoading = false;
          }, 25);
        });
      }
    },
    onMessageSubmit(message) {
      this.$store.dispatch('newChatMessage', message);
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
