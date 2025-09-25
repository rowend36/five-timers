<script setup lang="ts">
import { provide, ref, watch } from "vue";
import AuthProvider from "./components/AuthProvider.vue";
import ChaosTimer from "./components/ChaosTimer.vue";
import GoogleSignInButton from "./components/GoogleSignInButton.vue";
import TimerComponent from "./components/Timer.vue";
import { useAuth } from "./hooks/useAuth";
import { SyncManager } from "./services/SyncManager";
import { Howl } from "howler";
import sound from "./assets/warning.mp3";

// Create and provide state manager
const sync = new SyncManager();
provide("stateManager", sync.stateManager);

const authState = useAuth();
const isActive = ref(false);
const howl = new Howl({
  src: [sound],
  loop: true,
  autoplay: false,
});

const listener = () => {
  isActive.value = !!sync.stateManager.state.currentSprint;
  if (sync.stateManager.state.currentSprint === "chaos") {
    howl.play();
  } else {
    howl.stop();
  }
};
sync.stateManager.subscribe(listener);
watch(authState.user, (newV, oldV) => {
  if (oldV) {
    sync.clearSync();
  }
  if (newV) sync.initializeWithUser(newV.uid);
});

function resetTimers() {
  if (
    confirm(
      "Are you sure you want to reset all your timers? This action is irreversible."
    )
  )
    sync.stateManager.reset();
}
</script>

<template>
  <AuthProvider v-slot="{ isAuthenticated }">
    <div :class="{ app: true, 'active-app': isActive }">
      <header class="app-header">
        <h1>5 Timers</h1>
        <GoogleSignInButton />
      </header>

      <!-- Show timers only when authenticated -->
      <main v-if="isAuthenticated" class="timers-container">
        <div class="timers-grid">
          <TimerComponent
            class="timer-code"
            sprint-name="code"
            label="Code"
            bg-color="linear-gradient(135deg, #4CAF50, #2E7D32)"
            timer-color="#FFFFFF"
            text-color="#E8F5E8"
          />

          <TimerComponent
            class="timer-study"
            sprint-name="study"
            label="Study"
            bg-color="linear-gradient(135deg, #2196F3, #1565C0)"
            timer-color="#FFFFFF"
            text-color="#E3F2FD"
          />

          <TimerComponent
            class="timer-spirit"
            sprint-name="spirit"
            label="Spirit"
            bg-color="linear-gradient(135deg, #f5f5f5, #9E9E9E)"
            timer-color="#333333"
            text-color="#666666"
          />

          <TimerComponent
            class="timer-home"
            sprint-name="home"
            label="Home"
            bg-color="linear-gradient(135deg, #8D6E63, #5D4037)"
            timer-color="#FFFFFF"
            text-color="#EFEBE9"
          />

          <ChaosTimer class="timer-chaos" />
        </div>
        <button class="resetButton" v-on:click="resetTimers">
          Reset All Timers
        </button>
      </main>

      <!-- Welcome screen for unauthenticated users -->
      <main v-else class="welcome-screen">
        <div class="welcome-content">
          <h2>Welcome to 5 Timers</h2>
          <p>Track your Code, Study, Spirit, and Home activities.</p>
          <p>
            Sign in with Google to get started and sync your data across
            devices.
          </p>
        </div>
      </main>
    </div>
  </AuthProvider>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #212121;
  display: flex;
  flex-direction: column;
}

.active-app {
  background: conic-gradient(
    from 315deg,
    #1a3a1f 0%,
    #1f0d5b 30%,
    #3d2d1d 45%,
    #3a3a3a 80%,
    #1a3a1f 90%
  );
}
.app-header {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  max-width: 1024px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 600px) {
  .app-header {
    flex-direction: column;
    padding: 20px 0;
  }
}

.app-header h1 {
  color: white;
  font-size: 32px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.timers-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  flex: 1;
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.timers-grid {
  display: grid;
  place-items: center;
  grid-template-areas:
    "code . study"
    ". chaos ."
    "spirit . home";
  gap: 10px;
  width: 100%;
  height: 100%;
  padding: 20px 40px;
}

@media (max-width: 600px) {
  .timers-grid {
    grid-template-areas:
      "code"
      "study"
      "spirit"
      "home"
      "chaos";
    height: min-content;
  }
}

.timer-code {
  grid-area: code;
}
.timer-study {
  grid-area: study;
}
.timer-spirit {
  grid-area: spirit;
}
.timer-home {
  grid-area: home;
}
.timer-chaos {
  grid-area: chaos;
}

.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.welcome-content {
  text-align: center;
  color: white;
  max-width: 500px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.welcome-content h2 {
  font-size: 28px;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.welcome-content p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
  opacity: 0.9;
}
</style>

<!-- Installation & Setup Instructions -->
<!--
## Setup Steps:

1. **Install Firebase:**
   ```bash
   npm install firebase
   ```

2. **Firebase Console Setup:**
   - Go to https://console.firebase.google.com
   - Create new project or select existing
   - Enable Authentication > Google sign-in method
   - Add your domain to authorized domains
   - Copy config object to firebase.ts

3. **Update firebase.ts with your config:**
   ```typescript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-actual-project-id",
     // ... rest of config
   }
   ```

4. **Usage in components:**
   ```vue
   <script setup>
   import { inject } from 'vue'
   
   // Get auth state anywhere in app
   const auth = inject('auth')
   console.log(auth.user.value) // Current user
   </script>
   ```

## Features:
- ✅ Google OAuth integration
- ✅ Automatic auth state management
- ✅ Error handling & loading states
- ✅ Responsive design
- ✅ Vue 3 Composition API + TypeScript
- ✅ Context/provide injection
- ✅ Protected routes (timers only show when authenticated)
- ✅ User profile display
- ✅ Clean sign out functionality
-->
