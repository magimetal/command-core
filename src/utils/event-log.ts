const MAX_EVENT_LOG_ENTRIES = 7;

export const appendEventLog = (eventLog: string[], message: string): string[] => {
  return [message, ...eventLog].slice(0, MAX_EVENT_LOG_ENTRIES);
};

export const getVisibleEventLog = (
  eventLog: string[],
  count: number = MAX_EVENT_LOG_ENTRIES
): string[] => {
  const visible = eventLog.slice(0, count);

  while (visible.length < count) {
    visible.push('');
  }

  return visible;
};
