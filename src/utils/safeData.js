export const safeParse = (data) => {
  if (!data) return [];
  const clean = (obj, depth = 0) => {
    if (depth > 4) return undefined;
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(i => clean(i, depth+1)).filter(v => v !== undefined);
    const result = {};
    for (const key of Object.keys(obj)) {
      const val = clean(obj[key], depth+1);
      if (val !== undefined) result[key] = val;
    }
    return result;
  };
  const cleaned = clean(data);
  if (!cleaned) return [];
  return Array.isArray(cleaned) ? cleaned : [cleaned];
};
