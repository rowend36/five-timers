import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

// Define the state structure for Firestore
export interface TimerStateDoc {
  currentSprint: string | null;
  startTimeT: number;
  sprintStats: {
    code: number;
    study: number;
    spirit: number;
    home: number;
    chaos: number;
  };
  lastUpdated: any; // Firestore server timestamp
  createdAt?: any;
}

export class FirestoreSync {
  private unsubscribe: Unsubscribe | null = null;
  private userId: string | null = null;
  private onStateChange: ((state: any) => void) | null = null;

  constructor() {}

  // Initialize sync for a user
  async initializeSync(userId: string, onStateChange: (state: any) => void) {
    this.userId = userId;
    this.onStateChange = onStateChange;

    // Set up real-time listener
    const docRef = doc(db, "timerStates", userId);

    this.unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as TimerStateDoc;
          console.log("State synced from Firestore:", data);

          // Convert Firestore timestamp back to regular timestamp
          const state = {
            currentSprint: data.currentSprint,
            startTimeT: data.startTimeT,
            sprintStats: data.sprintStats,
          };

          this.onStateChange?.(state);
        } else {
          console.log("No existing state found, using defaults");
        }
      },
      (error) => {
        console.error("Error listening to state changes:", error);
      }
    );

    // Load initial state
    return this.loadState();
  }

  // Save state to Firestore
  async saveState(state: any): Promise<void> {
    if (!this.userId) {
      console.warn("No user ID, cannot save state");
      return;
    }

    try {
      const docRef = doc(db, "timerStates", this.userId);

      const stateDoc: TimerStateDoc = {
        currentSprint: state.currentSprint,
        startTimeT: state.startTimeT,
        sprintStats: state.sprintStats,
        lastUpdated: serverTimestamp(),
      };

      await setDoc(docRef, stateDoc, { merge: true });
      console.log("State saved to Firestore");
    } catch (error) {
      console.error("Error saving state:", error);
      throw error;
    }
  }

  // Load initial state from Firestore
  async loadState(): Promise<any | null> {
    if (!this.userId) {
      return null;
    }

    try {
      const docRef = doc(db, "timerStates", this.userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as TimerStateDoc;
        console.log("Initial state loaded from Firestore");

        return {
          currentSprint: data.currentSprint,
          startTimeT: data.startTimeT,
          sprintStats: data.sprintStats,
        };
      } else {
        console.log("No saved state found");
        return null;
      }
    } catch (error) {
      console.error("Error loading state:", error);
      return null;
    }
  }

  // Create initial document for new users
  async createInitialDocument(): Promise<void> {
    if (!this.userId) return;

    try {
      const docRef = doc(db, "timerStates", this.userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const initialState: TimerStateDoc = {
          currentSprint: null,
          startTimeT: Date.now(),
          sprintStats: {
            code: 0,
            study: 0,
            spirit: 0,
            home: 0,
            chaos: 0,
          },
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp(),
        };

        await setDoc(docRef, initialState);
        console.log("Initial document created for user");
      }
    } catch (error) {
      console.error("Error creating initial document:", error);
    }
  }

  // Clean up listener
  disconnect() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.userId = null;
    this.onStateChange = null;
  }
}
