type Listener<T = any> = (payload: T) => void;

export default class EventBus<Events extends Record<string, any>> {
  private events: {
    [K in keyof Events]?: Set<Listener<Events[K]>>;
  } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.events[event]) {
      this.events[event] = new Set();
    }
    this.events[event]!.add(listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.events[event]?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.events[event]?.forEach((listener) => {
      listener(payload);
    });
  }

  clear<K extends keyof Events>(event?: K): void {
    if (event) {
      this.events[event]?.clear();
    } else {
      this.events = {};
    }
  }
}



export const eventBus = new EventBus<AppEvents>();
