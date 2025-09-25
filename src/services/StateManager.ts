type SprintType = "code" | "study" | "spirit" | "home" | "chaos";
/**
 * Manages the state and timing logic for multiple sprint timers, including cooldowns and event notifications.
 *
 * The `StateManager` class tracks the currently active sprint, elapsed times for each sprint type,
 * and handles cooldown expiration, pausing, and resetting of timers. It provides a subscription mechanism
 * for external listeners to react to state changes and timer events.
 *
 * ## Features
 * - Tracks elapsed time for multiple sprint types: `code`, `study`, `spirit`, `home`, and `chaos`.
 * - Handles automatic cooldown expiration for active sprints, transitioning to "chaos" mode when needed.
 * - Allows starting, pausing, and resetting sprints, as well as resetting cooldowns.
 * - Emits events for state changes, such as sprint start, pause, cooldown expiration, and reset.
 * - Provides derived state including current timers, cooldown remaining, and total active time.
 *
 * ## Usage
 * - Use `subscribe()` to listen for state changes and timer events.
 * - Use `startSprint()`, `pauseSprint()`, `pingCooldown()`, and `reset()` to control timers.
 * - Use `getCurrentState()` and `getStats()` to query current timer and statistics information.
 *
 * @example
 * ```typescript
 * const manager = new StateManager();
 * manager.subscribe((eventType, data) => {
 *   console.log(eventType, data);
 * });
 * manager.startSprint('code');
 * ```
 */
export class StateManager {
  state: {
    currentSprint: SprintType | null;
    startTimeT: number;
    sprintStats: Record<SprintType, number>;
  };
  listeners: Set<(eventType: string, data: any) => void>;
  COOLDOWN_DURATION: number;

  constructor() {
    this.state = {
      currentSprint: null, // 'code', 'study', 'spirit', 'home', 'chaos', or null
      startTimeT: Date.now(),
      sprintStats: {
        code: 0,
        study: 0,
        spirit: 0,
        home: 0,
        chaos: 0,
      },
    };

    this.listeners = new Set();
    this.COOLDOWN_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.subscribe(console.log);
  }

  // Subscribe to state changes
  subscribe(callback: (eventType: string, data: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Emit events to all listeners
  emit(eventType: string, data: any) {
    this.listeners.forEach((callback) => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error("Error in state listener:", error);
      }
    });
  }

  // Get current state, handling cooldown expiration
  getCurrentState() {
    const now = Date.now();
    const currentState = { ...this.state };

    // Check if we need to handle cooldown expiration
    if (this.needsCooldownHandling(now)) {
      return this.handleCooldownExpiration(now);
    }

    // Calculate derived state
    return this.calculateDerivedState(currentState, now);
  }
  // Load state from external source
  loadState(newState: any): void {
    this.state = { ...newState };
    this.emit("stateLoaded", this.state);
  }
  // Get pure state for syncing
  getState() {
    return { ...this.state };
  }
  // Check if current corner timer has expired cooldown
  needsCooldownHandling(now: number) {
    const { currentSprint, startTimeT } = this.state;

    if (!currentSprint || currentSprint === "chaos") {
      return false;
    }

    const elapsed = now - startTimeT;
    return elapsed >= this.COOLDOWN_DURATION;
  }

  // Handle automatic cooldown expiration
  handleCooldownExpiration(now: number) {
    const { currentSprint, startTimeT, sprintStats } = this.state;
    const cooldownExpiredAt = startTimeT + this.COOLDOWN_DURATION;

    // Update state to cooldown expiration point
    if (currentSprint !== null) {
      const newSprintStats = {
        ...sprintStats,
        [currentSprint]: sprintStats[currentSprint] + this.COOLDOWN_DURATION,
      };

      // Create new state at cooldown expiration
      const expiredState = {
        currentSprint: "chaos" as const,
        startTimeT: cooldownExpiredAt,
        sprintStats: newSprintStats,
      };

      // Update internal state
      this.state = expiredState;
    }

    // Emit cooldown expiration event
    this.emit("cooldownExpired", {
      expiredSprint: currentSprint,
      expiredAt: cooldownExpiredAt,
      chaosStartedAt: cooldownExpiredAt,
    });

    // Return current derived state
    return this.calculateDerivedState(this.state, now);
  }

  // Calculate derived state from base state
  calculateDerivedState(baseState: StateManager["state"], now: number) {
    const { currentSprint, startTimeT, sprintStats } = baseState;
    const elapsed = now - startTimeT;

    // Calculate current timer values
    const currentTimers = {
      ...sprintStats,
    };

    // Add elapsed time to current running sprint
    if (currentSprint) {
      currentTimers[currentSprint] += elapsed;
    }

    // Calculate cooldown remaining for corner timers
    let cooldownRemaining = null;
    if (currentSprint && currentSprint !== "chaos") {
      cooldownRemaining = Math.max(0, this.COOLDOWN_DURATION - elapsed);
    }

    return {
      currentSprint,
      startTimeT,
      sprintStats,
      currentTimers,
      cooldownRemaining,
      isRunning: currentSprint !== null,
      elapsed,
    };
  }

  // Start a sprint (play button)
  startSprint(sprintName: SprintType) {
    const now = Date.now();
    const currentState = this.getCurrentState(); // This handles cooldown if needed

    // Update sprint stats with current progress
    const newSprintStats = {
      ...currentState.sprintStats,
      ...(currentState.currentSprint && {
        [currentState.currentSprint]:
          currentState.currentTimers[currentState.currentSprint],
      }),
    };

    // Update state
    this.state = {
      currentSprint: sprintName,
      startTimeT: now,
      sprintStats: newSprintStats,
    };

    // Emit event
    this.emit("sprintStarted", {
      sprint: sprintName,
      startedAt: now,
      previousSprint: currentState.currentSprint,
    });

    return this.getCurrentState();
  }

  // Pause current sprint (pause button)
  pauseSprint() {
    const now = Date.now();
    const currentState = this.getCurrentState(); // This handles cooldown if needed

    if (!currentState.currentSprint) {
      return currentState; // Nothing to pause
    }

    // Update sprint stats with final progress
    const newSprintStats = {
      ...currentState.sprintStats,
      [currentState.currentSprint]:
        currentState.currentTimers[currentState.currentSprint],
    };

    const pausedSprint = currentState.currentSprint;

    // Update state
    this.state = {
      currentSprint: null,
      startTimeT: now,
      sprintStats: newSprintStats,
    };

    // Emit event
    this.emit("sprintPaused", {
      sprint: pausedSprint,
      pausedAt: now,
      totalTime: newSprintStats[pausedSprint],
    });

    return this.getCurrentState();
  }

  // Reset cooldown (ping button)
  pingCooldown() {
    const now = Date.now();
    const currentState = this.getCurrentState();

    if (!currentState.currentSprint || currentState.currentSprint === "chaos") {
      return currentState; // Can't ping if not running corner timer
    }

    // Update sprint stats with final progress
    const newSprintStats = {
      ...currentState.sprintStats,
      [currentState.currentSprint]:
        currentState.currentTimers[currentState.currentSprint],
    };
    // Keep same sprint running, just reset the start time
    this.state = {
      ...currentState,
      sprintStats: newSprintStats,
      startTimeT: now,
    };

    // Emit event
    this.emit("cooldownReset", {
      sprint: currentState.currentSprint,
      resetAt: now,
    });

    return this.getCurrentState();
  }

  // Get stats summary
  getStats() {
    const currentState = this.getCurrentState();
    return {
      ...currentState.currentTimers,
      totalActiveTime:
        Object.values(currentState.currentTimers).reduce(
          (sum, time) => sum + time,
          0
        ) - currentState.currentTimers.chaos,
    };
  }

  // Reset all timers
  reset() {
    this.state = {
      currentSprint: null,
      startTimeT: Date.now(),
      sprintStats: {
        code: 0,
        study: 0,
        spirit: 0,
        home: 0,
        chaos: 0,
      },
    };

    this.emit("stateReset", { resetAt: Date.now() });
    return this.getCurrentState();
  }
}

export type { SprintType };
