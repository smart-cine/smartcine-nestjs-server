export function convertJwtExpireToSeconds(expire: string): number {
  // JWT_EXPIRES_IN = 10s, 60s, 1m, 1h, 1d, 1w, 1y
  const time = expire.match(/\d+/g);
  if (!time) {
    return 0;
  }
  const unit = expire.match(/\D+/g);
  if (!unit) {
    return 0;
  }
  const unitString = unit[0];
  switch (unitString) {
    case 's':
      return parseInt(time[0]);
    case 'm':
      return parseInt(time[0]) * 60;
    case 'h':
      return parseInt(time[0]) * 60 * 60;
    case 'd':
      return parseInt(time[0]) * 60 * 60 * 24;
    case 'w':
      return parseInt(time[0]) * 60 * 60 * 24 * 7;
    case 'y':
      return parseInt(time[0]) * 60 * 60 * 24 * 365;
    default:
      return 0;
  }
}
