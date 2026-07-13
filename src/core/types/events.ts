// Core events types - role-specific events are defined in each role's types/events.ts
export interface SdkEvents {
  [event: string]: (...args: unknown[]) => void
}

export type SdkEventName = keyof SdkEvents
