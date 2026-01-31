export const getDayKey = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
