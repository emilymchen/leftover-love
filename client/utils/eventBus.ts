import { ref } from "vue";

const eventBus = ref(new Map<string, Function[]>());

export function on(event: string, callback: Function) {
  if (!eventBus.value.has(event)) {
    eventBus.value.set(event, []);
  }
  eventBus.value.get(event)?.push(callback);
}

export function emitGlobal(event: string, ...args: any[]) {
  eventBus.value.get(event)?.forEach(callback => callback(...args));
}