export const limitLength = (value = '', length = 60) => {
  const str = String(value || '');
  const limit = Number(length);

  if (!Number.isFinite(limit) || limit <= 0) {
    return str;
  }

  return str.length > limit ? `${str.substring(0, limit)}...` : str;
};
