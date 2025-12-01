const gradientPresets = [
  { name: 'Default', colors: ['#d7d8b6ff', '#f2edadff', '#ffffffff'] },
  { name: 'Ocean', colors: ['#667eea', '#764ba2', '#f093fb'] },
  { name: 'Sunset', colors: ['#fa709a', '#fee140', '#ffecd2'] },
  { name: 'Forest', colors: ['#134e5e', '#71b280', '#d4fc79'] },
  { name: 'Purple', colors: ['#a8edea', '#fed6e3', '#ffecd2'] },
  { name: 'Fire', colors: ['#ff6b6b', '#feca57', '#ff9ff3'] },
];

let index = 0;

function setGradientIndex(i) {
  index = i;
}
export function setIndexByColor(color) {
    const presetIndex = gradientPresets.findIndex(p => p.colors[0] === color);
    setGradientIndex(presetIndex !== -1 ? presetIndex : 0);
}
export function getColor() {
  return gradientPresets[index].colors;
}

export function getGradientByName(name) {
  const preset = gradientPresets.find(p => p.name === name);
  return preset ? preset.colors : gradientPresets[0].colors;
}
export function getGradientByIndex(index) {
  const preset = gradientPresets[index];
  return preset ? preset.colors : gradientPresets[0].colors;
}
export function getAllGradientNames() {
  return gradientPresets.map(p => p.name);
}
export function getAllGradients() {
  return gradientPresets;
}



export default { getGradientByName, getGradientByIndex, getAllGradientNames, getAllGradients, setIndexByColor, getColor };