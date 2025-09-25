<script setup lang="ts">
import { computed } from "vue";
import { useTimerState } from "../hooks/useTimerState";

const { currentState, formatTime } = useTimerState();

const chaosTime = computed(() => {
  return currentState.value.currentTimers.chaos || 0;
});

const isChaosRunning = computed(() => {
  return currentState.value.currentSprint === "chaos";
});
</script>

<template>
  <div class="chaos-timer" :class="{ active: isChaosRunning }">
    <div class="chaos-label">CHAOS</div>
    <div class="chaos-display">
      {{ formatTime(chaosTime) }}
    </div>
    <div v-if="isChaosRunning" class="chaos-indicator">
      <div class="pulse-ring"></div>
      <div class="pulse-ring delay-1"></div>
      <div class="pulse-ring delay-2"></div>
    </div>
    <div v-if="isChaosRunning" class="chaos-glow"></div>
  </div>
</template>

<style scoped>
.chaos-timer {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #212121, #000000);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
  transition: all 0.5s ease;
  overflow: hidden;
}

.chaos-timer.active {
  border-color: #ff4444;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 68, 68, 0.3),
    inset 0 0 30px rgba(255, 68, 68, 0.1);
  animation: chaosBreathing 3s ease-in-out infinite;
}

@keyframes chaosBreathing {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 68, 68, 0.4),
      inset 0 0 40px rgba(255, 68, 68, 0.2);
  }
}

.chaos-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.chaos-timer.active .chaos-label {
  color: #ff4444;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5);
  animation: labelFlicker 4s ease-in-out infinite;
}

@keyframes labelFlicker {
  0%,
  90%,
  100% {
    opacity: 1;
  }
  95% {
    opacity: 0.7;
  }
}

.chaos-display {
  color: #ff4444;
  font-size: 18px;
  font-weight: bold;
  font-family: "Courier New", monospace;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
}

.chaos-timer.active .chaos-display {
  font-size: 20px;
  text-shadow: 0 0 15px rgba(255, 68, 68, 0.8), 0 0 25px rgba(255, 68, 68, 0.6),
    0 0 35px rgba(255, 68, 68, 0.4);
  animation: numberGlow 2s ease-in-out infinite;
}

@keyframes numberGlow {
  0%,
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.3);
  }
}

/* Chaos Indicator - Pulsing Rings */
.chaos-indicator {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 30px;
  height: 30px;
}

.pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 68, 68, 0.8);
  border-radius: 50%;
  animation: chaosRipple 2s linear infinite;
}

.pulse-ring.delay-1 {
  animation-delay: 0.7s;
}

.pulse-ring.delay-2 {
  animation-delay: 1.4s;
}

@keyframes chaosRipple {
  0% {
    transform: scale(0.1);
    opacity: 1;
    border-width: 3px;
  }
  50% {
    opacity: 0.7;
    border-width: 2px;
  }
  100% {
    transform: scale(2);
    opacity: 0;
    border-width: 1px;
  }
}

/* Background Glow Effect */
.chaos-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 68, 68, 0.1) 0%,
    rgba(255, 68, 68, 0.05) 30%,
    transparent 70%
  );
  border-radius: 50%;
  animation: chaosGlow 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes chaosGlow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2) rotate(180deg);
  }
}

/* Subtle inner shadow when not active */
.chaos-timer:not(.active)::before {
  content: "";
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border-radius: 50%;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

/* Hover effect when not active */
.chaos-timer:not(.active):hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 68, 68, 0.3);
}

/* Additional dramatic effects for longer chaos periods */
.chaos-timer.active::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(255, 68, 68, 0.1) 0deg,
    rgba(255, 68, 68, 0.2) 90deg,
    rgba(255, 68, 68, 0.1) 180deg,
    rgba(255, 68, 68, 0.2) 270deg,
    rgba(255, 68, 68, 0.1) 360deg
  );
  animation: chaosRotate 8s linear infinite;
  pointer-events: none;
}

@keyframes chaosRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
