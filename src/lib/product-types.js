export const SADDLE_TYPES = [
  'Dressage',
  'Show Jumping',
  'All Purpose',
  'Eventing',
  'Endurance',
  'Western',
  'Salto Ostacoli',
  'Uso Generale',
];

export function getSaddleTypeOptions(currentType = '') {
  const options = [...SADDLE_TYPES];

  if (currentType && !options.includes(currentType)) {
    options.unshift(currentType);
  }

  return options;
}
