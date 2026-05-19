export const GOOD_EVENT_TITLES: Record<number, string> = {
  5: 'Заряд для станции',
  10: 'Успешная миссия',
  20: 'Героический поступок',
  35: 'Звёздный рекорд',
  50: 'Легенда космоса',
};

export const BAD_EVENT_TITLES: Record<number, string> = {
  [-5]: 'Сбой в работе',
  [-10]: 'Утечка энергии',
  [-20]: 'Авария в отсеке',
  [-35]: 'Критическая угроза',
  [-50]: 'Сигнал бедствия',
};

export const getEventTitle = (type: string, weight: number): string => {
  if (type === 'good') return GOOD_EVENT_TITLES[weight] || 'Позитивное событие';
  if (type === 'bad') return BAD_EVENT_TITLES[weight] || 'Негативное событие';
  return 'Нейтральное событие';
};
