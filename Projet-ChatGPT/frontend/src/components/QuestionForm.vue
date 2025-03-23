<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="chat-container">
          <v-card-title class="text-center chat-title">My ChatGPT</v-card-title>
          <v-card-text class="chat-box">
            <v-list>
              <v-list-item v-for="(msg, index) in messages" :key="index" class="chat-item" :class="msg.isUser ? 'user' : 'bot'">
                <v-list-item-content>
                  <v-list-item-title class="message-text">{{ msg.text }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="input-container">
            <v-textarea
              v-model="question"
              label="Posez une question..."
              outlined
              auto-grow
              class="input-box"
              @keyup.enter="submitQuestion"
            ></v-textarea>
            <v-btn @click="submitQuestion" color="primary" :disabled="loading">Envoyer</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, nextTick } from "vue";
import axios from "axios";

export default {
  setup() {
    const question = ref("");
    const messages = ref([]);
    const loading = ref(false);

    const submitQuestion = async () => {
      if (!question.value.trim()) return;

      messages.value.push({ text: question.value, isUser: true });

      const placeholderMessage = { text: "...", isUser: false };
      messages.value.push(placeholderMessage);

      loading.value = true;

      try {
        const response = await axios.post("http://localhost:5000/questions", {
          content: question.value,
        });

        placeholderMessage.text = response.data.message;

        messages.value = [...messages.value];
      } catch (error) {
        placeholderMessage.text = "Erreur : Impossible d'obtenir une réponse.";
        messages.value = [...messages.value];
      } finally {
        loading.value = false;
        question.value = "";

        nextTick(scrollToBottom);
      }
    };

    const scrollToBottom = () => {
      nextTick(() => {
        const chatBox = document.querySelector(".chat-box");
        if (chatBox) {
          chatBox.scrollTop = chatBox.scrollHeight;
        }
      });
    };

    return {
      question,
      messages,
      loading,
      submitQuestion,
    };
  },
};
</script>


<style scoped>
.chat-container {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 12px;
  background: #f5f5f5;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}
.chat-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  padding-bottom: 10px;
}
.chat-box {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
  background: white;
  border-radius: 8px;
}
.chat-item {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  word-wrap: break-word;
  max-width: 80%;
}
.user {
  background: #1565c0;
  color: white;
  align-self: flex-end;
  text-align: right;
  margin-left: auto;
}
.bot {
  background: #e3f2fd;
  color: #333;
  align-self: flex-start;
}
.message-text {
  white-space: pre-wrap;
}
.input-container {
  display: flex;
  align-items: center;
  padding: 10px;
}
.input-box {
  flex-grow: 1;
  min-height: 50px;
  max-height: 150px;
}
</style>