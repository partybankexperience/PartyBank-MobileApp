import NetInfo from "@react-native-community/netinfo";

type EventCallback = (isOnline: boolean) => void;

class NetworkService {
  private isConnected: boolean = true;
  private isInternetReachable: boolean = true;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasConnected = this.isConnected && this.isInternetReachable;
      this.isConnected = state.isConnected ?? false;
      this.isInternetReachable = state.isInternetReachable ?? false;

      const isNowConnected = this.isConnected && this.isInternetReachable;

      if (wasConnected !== isNowConnected) {
        this.emit("connectivityChange", isNowConnected);
      }
    });
  }

  async checkConnectivity(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected ?? false;
    this.isInternetReachable = state.isInternetReachable ?? false;
    return this.isConnected && this.isInternetReachable;
  }

  get isOnline(): boolean {
    return this.isConnected && this.isInternetReachable;
  }

  on(eventName: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(callback);

    return () => {
      this.off(eventName, callback);
    };
  }

  off(eventName: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  private emit(eventName: string, data: boolean): void {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}

export const networkService = new NetworkService();
