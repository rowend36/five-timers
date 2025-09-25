import { FirestoreSync } from "./FirestoreSync";
import { StateManager } from "./StateManager";

export class SyncManager {
  public stateManager: StateManager;
  public syncManager: FirestoreSync;
  private isInitialized: boolean = false;

  constructor() {
    this.stateManager = new StateManager();
    this.syncManager = new FirestoreSync();

    // Forward state events
    this.stateManager.subscribe((eventType: string) => {
      // Auto-sync on state changes (except loads)
      if (this.isInitialized && eventType !== "stateLoaded") {
        this.syncManager.saveState(this.stateManager.getState());
      }
    });
  }

  // Initialize with user
  async initializeWithUser(userId: string): Promise<void> {
    // Set up sync and load initial state
    const initialState = await this.syncManager.initializeSync(
      userId,
      (remoteState) => {
        // Handle remote changes (from other devices)
        if (this.isInitialized) {
          this.stateManager.loadState(remoteState);
        }
      }
    );

    // Load initial state if exists
    if (initialState) {
      this.stateManager.loadState(initialState);
    }

    this.isInitialized = true;
  }

  // Clear sync (e.g., on sign-out)
  clearSync(): void {
    this.syncManager.disconnect?.();
    this.isInitialized = false;
    this.stateManager.reset();
  }
}
