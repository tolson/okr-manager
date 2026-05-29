declare var pendo: {
  track: (eventName: string, properties?: Record<string, string | number | boolean>) => void;
  trackAgent: (eventType: string, metadata: object) => void;
};
