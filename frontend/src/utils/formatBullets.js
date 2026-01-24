export const formatBulletPoints = (description) => {
  if (!description) return [];
  
  // Split by bullet point (•) or new lines
  const bullets = description
    .split(/[•\n]+/)  // Split by bullet or newline
    .map(bullet => bullet.trim())  // Remove whitespace
    .filter(bullet => bullet.length > 0);  // Remove empty lines
  
  return bullets;
};