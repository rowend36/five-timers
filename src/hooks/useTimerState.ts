// useTimerState.js - Composable hook
import { ref, computed, onMounted, onUnmounted, inject } from "vue";
import type { SprintType, StateManager } from "../services/StateManager";

export function useTimerState() {
  const stateManager: StateManager | undefined = inject("stateManager");
  if (!stateManager) {
    throw new Error("stateManager not provided");
  }
  const currentState = ref(stateManager.getCurrentState());
  const displayUpdateInterval = ref<number | null>(null);

  // Update display every second for smooth UI
  const startDisplayUpdates = () => {
    displayUpdateInterval.value = setInterval(() => {
      currentState.value = stateManager.getCurrentState();
    }, 1000);
  };

  const stopDisplayUpdates = () => {
    if (displayUpdateInterval.value) {
      clearInterval(displayUpdateInterval.value);
      displayUpdateInterval.value = null;
    }
  };

  // Subscribe to state changes for immediate updates
  let unsubscribe: Function | undefined;
  onMounted(() => {
    unsubscribe = stateManager.subscribe(() => {
      currentState.value = stateManager.getCurrentState();
    });
    startDisplayUpdates();
  });

  onUnmounted(() => {
    stopDisplayUpdates();
    if (unsubscribe) {
      unsubscribe();
    }
  });

  // Actions
  const startSprint = (sprintName: SprintType) => {
    stateManager.startSprint(sprintName);
  };

  const pauseSprint = () => {
    stateManager.pauseSprint();
  };

  const pingCooldown = () => {
    stateManager.pingCooldown();
  };

  // Helper function to format time
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatCooldown = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    currentState: computed(() => currentState.value),
    startSprint,
    pauseSprint,
    pingCooldown,
    formatTime,
    formatCooldown,
  };
}
