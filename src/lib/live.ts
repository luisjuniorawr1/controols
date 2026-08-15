import type { Tool } from '@/src/data/catalog';

const additionalLiveCategories = new Set(['data', 'document', 'qr', 'file', 'image', 'pdf', 'video', 'audio']);

export function isToolLive(tool: Tool) {
  return tool.live || additionalLiveCategories.has(tool.category);
}
