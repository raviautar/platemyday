const dotColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
];

const badgeColors = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-yellow-100 text-yellow-700',
  'bg-red-100 text-red-700',
  'bg-indigo-100 text-indigo-700',
];

function hashTag(tag: string): number {
  return tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export function getTagDotColor(tag: string): string {
  return dotColors[hashTag(tag) % dotColors.length];
}

export function getTagBadgeColor(tag: string): string {
  return badgeColors[hashTag(tag) % badgeColors.length];
}
