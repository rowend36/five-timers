<script setup lang="ts">
import { computed } from "vue";
import { useTimerState } from "../hooks/useTimerState";
import type { SprintType } from "../services/StateManager";

interface Props {
  sprintName: SprintType;
  label: string;
  bgColor: string;
  timerColor?: string;
  textColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  timerColor: "#FFFFFF",
  textColor: "#FFFFFF",
});

const {
  currentState,
  startSprint,
  pauseSprint,
  pingCooldown,
  formatTime,
  formatCooldown,
} = useTimerState();

// Computed properties
const currentTimerValue = computed(() => {
  return currentState.value.currentTimers[props.sprintName] || 0;
});

const isCurrentlyRunning = computed(() => {
  return currentState.value.currentSprint === props.sprintName;
});

const isCurrentlyFaded = computed(() => {
  return (
    currentState.value.currentSprint &&
    currentState.value.currentSprint !== props.sprintName
  );
});

const cooldownRemaining = computed(() => {
  return currentState.value.cooldownRemaining || 0;
});

const showCooldown = computed(() => {
  return isCurrentlyRunning.value && cooldownRemaining.value > 0;
});

const canPing = computed(() => {
  return isCurrentlyRunning.value && props.sprintName !== "chaos";
});

// Styles
const containerStyle = computed(() => ({
  background: props.bgColor,
  opacity: isCurrentlyFaded.value ? 0.5 : 1,
}));

const timerDisplayStyle = computed(() => ({
  color: props.timerColor,
}));

const cooldownDisplayStyle = computed(() => ({
  color: props.textColor,
  opacity: "0.8",
}));

// Event handlers
const handlePlay = () => {
  if (!isCurrentlyRunning.value) {
    startSprint(props.sprintName);
  }
};

const handlePause = () => {
  if (isCurrentlyRunning.value) {
    pauseSprint();
  }
};

const handlePing = () => {
  if (canPing.value) {
    pingCooldown();
  }
};
</script>

<template>
  <div class="timer-container" :style="containerStyle">
    <div class="timer-main">
      <div class="timer-label">{{ label }}</div>
      <div class="timer-display" :style="timerDisplayStyle">
        {{ formatTime(currentTimerValue) }}
      </div>
      <div class="cooldown-display" :style="cooldownDisplayStyle">
        {{ showCooldown ? formatCooldown(cooldownRemaining) : " " }}
      </div>
    </div>
    <div class="timer-controls">
      <button
        class="control-btn play-btn"
        @click="handlePlay"
        :disabled="isCurrentlyRunning"
        :class="{ active: isCurrentlyRunning }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
          />
        </svg>
      </button>
      <button
        class="control-btn pause-btn"
        @click="handlePause"
        :disabled="!isCurrentlyRunning"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 5.25v13.5m-7.5-13.5v13.5"
          />
        </svg>
      </button>
      <button
        class="control-btn ping-btn"
        @click="handlePing"
        :disabled="!canPing"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.timer-container {
  width: 200px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  transition: all 0.3s ease;
}

@media screen and (max-width: 600px) {
  .timer-container {
    flex-direction: row;
    justify-content: space-between;
    padding: 20px 0 20px 20px;
    width: 100%;
  }
}

.timer-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}
.timer-main {
  flex: 1;
}

@media screen and (max-width: 600px) {
  .timer-main {
    flex-basis: 100vw;
  }
}
.timer-label {
  font-size: 16px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.timer-display {
  font-size: 28px;
  font-weight: bold;
  font-family: "Courier New", monospace;
  margin-bottom: 5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  min-height: 30px;
  display: flex;
  align-items: center;
}

@media screen and (max-width: 600px) {
  .timer-display {
    margin-top: 20px;
  }
}

.cooldown-display {
  font-size: 14px;
  font-family: "Courier New", monospace;
  margin-bottom: 10px;
  min-height: 20px;
  display: flex;
  align-items: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.timer-controls {
  display: flex;
  gap: 8px;
  margin-top: auto;
  flex-wrap: wrap;
}

.control-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media screen and (max-width: 600px) {
  .control-btn {
    width: 30px;
    height: 30px;
  }
}
.control-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.control-btn.active {
  background: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.play-btn.active {
  background: rgba(76, 175, 80, 0.3);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}
</style>
