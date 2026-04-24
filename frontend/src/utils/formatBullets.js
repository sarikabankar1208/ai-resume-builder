/*export const formatBulletPoints = (description) => {
  if (!description) return [];
  
  // Split by bullet point (•) or new lines
  const bullets = description
    .split(/[•\n]+/)  // Split by bullet or newline
    .map(bullet => bullet.trim())  // Remove whitespace
    .filter(bullet => bullet.length > 0);  // Remove empty lines
  
  return bullets;
};*/

export const formatBulletPoints = (description) => {
  if (!description) return [];

  // If already array → use directly
  if (Array.isArray(description)) {
    return description;
  }

  // If string → convert to bullets
  if (typeof description === "string") {
    return description
      .replace(/\s+/g, " ")
      .split(/[\.\•\n]/)
      .map((line) => line.trim())
      .filter((line) => line.length > 5);
  }

  // fallback
  return [];
};