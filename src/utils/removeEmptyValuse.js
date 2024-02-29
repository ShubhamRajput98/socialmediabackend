export const removeEmptyValues = (obj) => {
  for (const key in obj) {
    if (
      obj[key] === null ||
      obj[key] === undefined ||
      obj[key] === "" ||
      obj[key] === "[]" ||
      (Array.isArray(obj[key]) && obj[key].length === 0)
    ) {
      delete obj[key];
      delete obj["password"];
    }
  }
  return obj;
};
