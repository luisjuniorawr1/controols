import type { Tool } from '@/src/data/catalog';

const additionalLiveCategories = new Set(['data', 'document', 'qr', 'file']);

export function isToolLive(tool: Tool) {
  return tool.live || additionalLiveCategories.has(tool.category);
}
