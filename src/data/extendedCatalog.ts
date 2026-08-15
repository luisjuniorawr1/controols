import { categories, locales, titleFromSlug, tools as baseTools, type CategoryId, type Locale, type Tool } from './catalog';
import { pineToolExtras } from './pineToolsExtras';

const seen = new Set<string>();

export const tools: Tool[] = [
  ...baseTools,
  ...pineToolExtras.map(({slug,category})=>({slug,category:category as CategoryId,title:titleFromSlug(slug),live:true}))
].filter(tool=>!seen.has(tool.slug)&&Boolean(seen.add(tool.slug)));

export { categories, locales };
export type { CategoryId, Locale, Tool };
export function getTool(slug:string){return tools.find(tool=>tool.slug===slug);}
export function getCategory(id:string){return categories.find(category=>category.id===id);}
export function getToolsByCategory(id:string){return tools.filter(tool=>tool.category===id);}
