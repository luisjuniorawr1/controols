import type { Locale } from './data/catalog';

export const copy: Record<Locale, {
  tagline: string; subtitle: string; search: string; allTools: string; categories: string;
  privateBadge: string; browserNote: string; tools: string; ready: string; building: string;
  input: string; output: string; run: string; copy: string; clear: string; placeholder: string;
}> = {
  en: { tagline: 'Everything. Under control.', subtitle: '400 fast, free and privacy-first online tools.', search: 'Search 400 tools…', allTools: 'All tools', categories: 'Categories', privateBadge: 'Private by design', browserNote: 'Your data is processed in your browser whenever possible.', tools: 'tools', ready: 'Ready now', building: 'Browser engine being connected', input: 'Input', output: 'Output', run: 'Run tool', copy: 'Copy', clear: 'Clear', placeholder: 'Type or paste here…' },
  pt: { tagline: 'Tudo sob controle.', subtitle: '400 ferramentas online rápidas, gratuitas e focadas em privacidade.', search: 'Buscar entre 400 ferramentas…', allTools: 'Todas as ferramentas', categories: 'Categorias', privateBadge: 'Privacidade por padrão', browserNote: 'Seus dados são processados no navegador sempre que possível.', tools: 'ferramentas', ready: 'Disponível agora', building: 'Motor no navegador sendo conectado', input: 'Entrada', output: 'Saída', run: 'Executar', copy: 'Copiar', clear: 'Limpar', placeholder: 'Digite ou cole aqui…' },
  es: { tagline: 'Todo bajo control.', subtitle: '400 herramientas online rápidas, gratuitas y privadas.', search: 'Buscar entre 400 herramientas…', allTools: 'Todas las herramientas', categories: 'Categorías', privateBadge: 'Privacidad por diseño', browserNote: 'Tus datos se procesan en el navegador siempre que sea posible.', tools: 'herramientas', ready: 'Disponible ahora', building: 'Motor del navegador en integración', input: 'Entrada', output: 'Salida', run: 'Ejecutar', copy: 'Copiar', clear: 'Limpiar', placeholder: 'Escribe o pega aquí…' },
  zh: { tagline: '一切尽在掌控。', subtitle: '400 个快速、免费、注重隐私的在线工具。', search: '搜索 400 个工具…', allTools: '全部工具', categories: '分类', privateBadge: '隐私优先', browserNote: '在可能的情况下，数据直接在浏览器中处理。', tools: '个工具', ready: '可立即使用', building: '浏览器引擎正在接入', input: '输入', output: '输出', run: '运行工具', copy: '复制', clear: '清除', placeholder: '在此输入或粘贴…' },
  hi: { tagline: 'सब कुछ नियंत्रण में।', subtitle: '400 तेज़, मुफ़्त और गोपनीयता-केंद्रित ऑनलाइन टूल।', search: '400 टूल खोजें…', allTools: 'सभी टूल', categories: 'श्रेणियाँ', privateBadge: 'गोपनीयता पहले', browserNote: 'जहाँ संभव हो, आपका डेटा ब्राउज़र में ही प्रोसेस होता है।', tools: 'टूल', ready: 'अभी उपलब्ध', building: 'ब्राउज़र इंजन जोड़ा जा रहा है', input: 'इनपुट', output: 'आउटपुट', run: 'चलाएँ', copy: 'कॉपी', clear: 'साफ़ करें', placeholder: 'यहाँ टाइप या पेस्ट करें…' },
};

export function isLocale(value: string): value is Locale {
  return ['en', 'pt', 'es', 'zh', 'hi'].includes(value);
}
