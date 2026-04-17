import { create } from "zustand";

type Task = () => void | Promise<any>;

interface TaskQueueState {
  queue: Task[];
  enqueue: (task: Task) => void;
  dequeueAndRun: () => Promise<void>;
  clear: () => void;
}

export const useTaskQueue = create<TaskQueueState>((set, get) => ({
  queue: [],

  enqueue: (task) =>
    set((state) => ({
      queue: [...state.queue, task],
    })),

  dequeueAndRun: async () => {
    const { queue } = get();
    if (queue.length === 0) return;

    const task = queue[0];

    // Remove first task
    set((state) => ({
      queue: state.queue.slice(1),
    }));

    // Execute task
    await task();
  },

  clear: () => set({ queue: [] }),
}));
