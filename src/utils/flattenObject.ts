export function flattenObject(
  obj: Record<string, any>,
  prefix = ""
): Record<string, any> {
  return Object.keys(obj || {}).reduce((acc: Record<string, any>, key) => {
    const val = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(acc, flattenObject(val, newKey));
    } else {
      acc[newKey] = Array.isArray(val)
        ? JSON.stringify(val)
        : typeof val === "boolean"
        ? String(val)
        : val;
    }
    return acc;
  }, {});
}
