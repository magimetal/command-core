const MAX_EVENT_LOG_ENTRIES = 5;

export const appendEventLog = (eventLog: string[], message: string): string[] => {
  return [message, ...eventLog].slice(0, MAX_EVENT_LOG_ENTRIES);
};

export const getVisibleEventLog = (eventLog: string[]): string[] => {
  const visible = eventLog.slice(0, MAX_EVENT_LOG_ENTRIES);

  while (visible.length < MAX_EVENT_LOG_ENTRIES) {
    visible.push('');
  }

  return visible;
};
