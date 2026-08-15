export const locales = ['en', 'pt', 'es', 'zh', 'hi'] as const;
export type Locale = (typeof locales)[number];

export type CategoryId = 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'developer' | 'data' | 'qr' | 'design' | 'calculator' | 'unit' | 'date' | 'security' | 'file' | 'document' | 'geo';

export type Tool = { slug: string; category: CategoryId; title: string; live: boolean; };

export const categories = [
  { id: 'image' as CategoryId, icon: '◫', labels: { en: 'Image', pt: 'Imagem', es: 'Imagen', zh: '图像', hi: 'इमेज' } },
  { id: 'pdf' as CategoryId, icon: '▤', labels: { en: 'PDF', pt: 'PDF', es: 'PDF', zh: 'PDF', hi: 'PDF' } },
  { id: 'video' as CategoryId, icon: '▶', labels: { en: 'Video', pt: 'Vídeo', es: 'Video', zh: '视频', hi: 'वीडियो' } },
  { id: 'audio' as CategoryId, icon: '♫', labels: { en: 'Audio', pt: 'Áudio', es: 'Audio', zh: '音频', hi: 'ऑडियो' } },
  { id: 'text' as CategoryId, icon: 'Aa', labels: { en: 'Text', pt: 'Texto', es: 'Texto', zh: '文本', hi: 'टेक्स्ट' } },
  { id: 'developer' as CategoryId, icon: '</>', labels: { en: 'Developer', pt: 'Desenvolvedor', es: 'Desarrollo', zh: '开发者', hi: 'डेवलपर' } },
  { id: 'data' as CategoryId, icon: '▦', labels: { en: 'Data', pt: 'Dados', es: 'Datos', zh: '数据', hi: 'डेटा' } },
  { id: 'qr' as CategoryId, icon: '⌗', labels: { en: 'QR & Barcode', pt: 'QR e Código', es: 'QR y Código', zh: '二维码与条码', hi: 'QR और बारकोड' } },
  { id: 'design' as CategoryId, icon: '◉', labels: { en: 'Design & Color', pt: 'Design e Cor', es: 'Diseño y Color', zh: '设计与颜色', hi: 'डिज़ाइन और रंग' } },
  { id: 'calculator' as CategoryId, icon: '∑', labels: { en: 'Calculators', pt: 'Calculadoras', es: 'Calculadoras', zh: '计算器', hi: 'कैलकुलेटर' } },
  { id: 'unit' as CategoryId, icon: '⇄', labels: { en: 'Unit Converters', pt: 'Conversores', es: 'Conversores', zh: '单位转换', hi: 'इकाई कन्वर्टर' } },
  { id: 'date' as CategoryId, icon: '◷', labels: { en: 'Date & Time', pt: 'Data e Hora', es: 'Fecha y Hora', zh: '日期与时间', hi: 'दिनांक और समय' } },
  { id: 'security' as CategoryId, icon: '◇', labels: { en: 'Security', pt: 'Segurança', es: 'Seguridad', zh: '安全', hi: 'सुरक्षा' } },
  { id: 'file' as CategoryId, icon: '▱', labels: { en: 'Files', pt: 'Arquivos', es: 'Archivos', zh: '文件', hi: 'फ़ाइलें' } },
  { id: 'document' as CategoryId, icon: '▧', labels: { en: 'Documents', pt: 'Documentos', es: 'Documentos', zh: '文档', hi: 'दस्तावेज़' } },
  { id: 'geo' as CategoryId, icon: '◎', labels: { en: 'Geography', pt: 'Geografia', es: 'Geografía', zh: '地理', hi: 'भूगोल' } },
] as const;

const catalog: Record<CategoryId, string[]> = {
  image: ['jpg-to-png', 'png-to-jpg', 'jpg-to-webp', 'png-to-webp', 'webp-to-jpg', 'webp-to-png', 'bmp-to-png', 'bmp-to-jpg', 'svg-to-png', 'gif-to-png', 'compress-jpg', 'compress-png', 'compress-webp', 'resize-image', 'resize-image-by-percent', 'crop-image', 'rotate-image-left', 'rotate-image-right', 'flip-image-horizontal', 'flip-image-vertical', 'grayscale-image', 'sepia-image', 'invert-image-colors', 'adjust-image-brightness', 'adjust-image-contrast', 'adjust-image-saturation', 'blur-image', 'sharpen-image', 'pixelate-image', 'add-text-watermark', 'add-image-watermark', 'remove-image-metadata', 'view-image-metadata', 'image-to-base64', 'base64-to-image', 'image-color-picker', 'image-dimensions', 'change-image-dpi', 'make-square-image', 'create-favicon'],
  pdf: ['merge-pdf', 'split-pdf', 'extract-pdf-pages', 'delete-pdf-pages', 'reorder-pdf-pages', 'rotate-pdf-pages', 'jpg-to-pdf', 'png-to-pdf', 'images-to-pdf', 'pdf-to-jpg', 'pdf-to-png', 'add-pdf-watermark', 'add-page-numbers-to-pdf', 'add-text-to-pdf', 'add-image-to-pdf', 'sign-pdf', 'fill-pdf-form', 'flatten-pdf', 'compress-pdf', 'protect-pdf', 'unlock-pdf', 'pdf-page-size', 'pdf-metadata-viewer', 'pdf-metadata-remover', 'blank-pdf-creator'],
  video: ['mp4-to-webm', 'webm-to-mp4', 'mov-to-mp4', 'mkv-to-mp4', 'avi-to-mp4', 'video-to-gif', 'gif-to-video', 'extract-audio-from-video', 'remove-audio-from-video', 'trim-video', 'cut-video', 'merge-videos', 'compress-video', 'resize-video', 'rotate-video', 'flip-video', 'change-video-speed', 'change-video-fps', 'change-video-resolution', 'video-to-mp3', 'video-to-wav', 'extract-video-frames', 'add-text-to-video', 'add-watermark-to-video', 'video-metadata-viewer'],
  audio: ['wav-to-mp3', 'mp3-to-wav', 'ogg-to-mp3', 'm4a-to-mp3', 'aac-to-mp3', 'flac-to-mp3', 'mp3-to-ogg', 'trim-audio', 'cut-audio', 'merge-audio', 'compress-audio', 'change-audio-volume', 'normalize-audio', 'change-audio-speed', 'reverse-audio', 'fade-in-audio', 'fade-out-audio', 'audio-metadata-viewer', 'remove-audio-metadata', 'audio-duration'],
  text: ['word-counter', 'character-counter', 'sentence-counter', 'paragraph-counter', 'line-counter', 'reading-time-calculator', 'uppercase-text', 'lowercase-text', 'title-case-text', 'sentence-case-text', 'capitalize-words', 'alternating-case-text', 'reverse-text', 'reverse-words', 'remove-extra-spaces', 'remove-line-breaks', 'add-line-numbers', 'remove-line-numbers', 'sort-lines-ascending', 'sort-lines-descending', 'remove-duplicate-lines', 'shuffle-lines', 'deduplicate-words', 'find-and-replace-text', 'extract-emails', 'extract-urls', 'extract-numbers', 'extract-hashtags', 'remove-accents', 'slug-generator', 'text-to-binary', 'binary-to-text', 'text-to-morse', 'morse-to-text', 'lorem-ipsum-generator'],
  developer: ['json-formatter', 'json-minifier', 'json-validator', 'json-sorter', 'json-escape', 'json-unescape', 'base64-encode', 'base64-decode', 'url-encode', 'url-decode', 'html-encode', 'html-decode', 'unicode-escape', 'unicode-unescape', 'hex-to-text', 'text-to-hex', 'decimal-to-hex', 'hex-to-decimal', 'binary-to-decimal', 'decimal-to-binary', 'timestamp-to-date', 'date-to-timestamp', 'jwt-decoder', 'uuid-generator', 'nanoid-generator', 'regex-tester', 'regex-escape', 'html-beautifier', 'css-beautifier', 'javascript-beautifier', 'html-minifier', 'css-minifier', 'javascript-minifier', 'sql-formatter', 'markdown-preview', 'markdown-to-html', 'html-to-markdown', 'diff-checker', 'query-string-parser', 'user-agent-parser'],
  data: ['csv-to-json', 'json-to-csv', 'csv-viewer', 'csv-sorter', 'csv-filter', 'csv-remove-duplicates', 'csv-column-picker', 'csv-column-renamer', 'csv-delimiter-converter', 'tsv-to-csv', 'csv-to-tsv', 'xml-to-json', 'json-to-xml', 'yaml-to-json', 'json-to-yaml', 'yaml-validator', 'xml-formatter', 'xml-minifier', 'json-to-query-string', 'query-string-to-json', 'json-flatten', 'json-unflatten', 'json-key-extractor', 'json-value-extractor', 'data-table-to-markdown'],
  qr: ['qr-code-generator', 'url-qr-code', 'wifi-qr-code', 'email-qr-code', 'phone-qr-code', 'sms-qr-code', 'whatsapp-qr-code', 'location-qr-code', 'contact-vcard-qr-code', 'event-qr-code', 'text-barcode-code128', 'ean13-barcode-generator', 'ean8-barcode-generator', 'upca-barcode-generator', 'code39-barcode-generator', 'itf-barcode-generator', 'codabar-generator', 'qr-code-reader', 'barcode-reader', 'qr-code-svg-generator'],
  design: ['hex-to-rgb', 'rgb-to-hex', 'hex-to-hsl', 'hsl-to-hex', 'rgb-to-hsl', 'hsl-to-rgb', 'hex-to-cmyk', 'cmyk-to-hex', 'color-contrast-checker', 'wcag-contrast-ratio', 'complementary-color', 'analogous-colors', 'triadic-colors', 'tetradic-colors', 'color-shades-generator', 'color-tints-generator', 'random-color-generator', 'gradient-generator', 'css-box-shadow-generator', 'css-text-shadow-generator', 'border-radius-generator', 'css-filter-generator', 'opacity-color-generator', 'aspect-ratio-calculator', 'px-to-rem', 'rem-to-px', 'px-to-cm', 'cm-to-px', 'print-size-calculator', 'dpi-calculator'],
  calculator: ['percentage-calculator', 'percentage-change-calculator', 'discount-calculator', 'markup-calculator', 'margin-calculator', 'profit-calculator', 'vat-calculator', 'simple-interest-calculator', 'compound-interest-calculator', 'loan-payment-calculator', 'bmi-calculator', 'bmr-calculator', 'age-calculator', 'average-calculator', 'median-calculator', 'mode-calculator', 'standard-deviation-calculator', 'fraction-calculator', 'ratio-calculator', 'rule-of-three-calculator', 'gcd-calculator', 'lcm-calculator', 'prime-number-checker', 'factorial-calculator', 'square-root-calculator', 'power-calculator', 'logarithm-calculator', 'circle-area-calculator', 'rectangle-area-calculator', 'triangle-area-calculator'],
  unit: ['length-converter', 'area-converter', 'volume-converter', 'mass-converter', 'temperature-converter', 'speed-converter', 'pressure-converter', 'energy-converter', 'power-converter', 'time-converter', 'angle-converter', 'data-size-converter', 'frequency-converter', 'torque-converter', 'fuel-economy-converter', 'acceleration-converter', 'density-converter', 'force-converter', 'electric-current-converter', 'voltage-converter', 'resistance-converter', 'capacitance-converter', 'inductance-converter', 'luminance-converter', 'illuminance-converter', 'flow-rate-converter', 'digital-transfer-rate-converter', 'typography-unit-converter', 'cooking-volume-converter', 'cooking-weight-converter', 'shoe-size-converter', 'clothing-size-converter', 'screen-size-converter', 'paper-size-converter', 'astronomical-distance-converter'],
  date: ['days-between-dates', 'business-days-between-dates', 'add-days-to-date', 'subtract-days-from-date', 'add-months-to-date', 'subtract-months-from-date', 'week-number-calculator', 'day-of-year-calculator', 'date-difference-calculator', 'countdown-calculator', 'time-zone-offset-calculator', 'unix-time-converter', 'iso-date-converter', 'leap-year-checker', 'calendar-date-calculator'],
  security: ['sha1-hash-generator', 'sha256-hash-generator', 'sha384-hash-generator', 'sha512-hash-generator', 'file-sha256-checksum', 'random-password-generator', 'passphrase-generator', 'secure-random-number', 'secure-random-string', 'password-strength-checker', 'uuid-v4-generator', 'random-token-generator', 'random-api-key-generator', 'hmac-sha256-generator', 'aes-encrypt-text', 'aes-decrypt-text', 'base32-encode', 'base32-decode', 'totp-secret-generator', 'string-entropy-calculator'],
  file: ['zip-files', 'unzip-files', 'gzip-file', 'ungzip-file', 'file-size-viewer', 'file-mime-type-checker', 'file-extension-checker', 'file-to-base64', 'base64-to-file', 'file-checksum'],
  document: ['markdown-editor', 'html-editor', 'plain-text-editor', 'markdown-to-text', 'html-to-text', 'text-to-html', 'text-to-markdown', 'markdown-table-generator', 'html-table-generator', 'resume-text-builder', 'invoice-text-builder', 'letter-text-builder', 'meeting-notes-builder', 'checklist-builder', 'document-word-statistics'],
  geo: ['distance-between-coordinates', 'bearing-calculator', 'midpoint-calculator', 'latitude-longitude-parser', 'decimal-degrees-to-dms', 'dms-to-decimal-degrees', 'gps-coordinate-validator', 'map-bounding-box-calculator', 'circle-radius-area-calculator', 'haversine-distance-calculator', 'speed-from-distance-time', 'travel-time-calculator', 'coordinate-rounder', 'geojson-point-generator', 'geojson-bounding-box-generator'],
};

const acronyms = new Set(['jpg','jpeg','png','webp','bmp','svg','gif','pdf','mp4','webm','mov','mkv','avi','mp3','wav','ogg','m4a','aac','flac','csv','json','tsv','xml','yaml','qr','ean13','ean8','upca','code128','itf','html','css','javascript','sql','jwt','uuid','nanoid','wcag','rgb','hex','hsl','cmyk','px','rem','cm','dpi','bmi','bmr','vat','gcd','lcm','sha1','sha256','sha384','sha512','hmac','aes','totp','gps','dms','geojson','iso','url','api']);

export function titleFromSlug(slug: string) {
  return slug.split('-').map((word) => acronyms.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export const tools: Tool[] = Object.entries(catalog).flatMap(([category, slugs]) =>
  slugs.map((slug) => ({ slug, category: category as CategoryId, title: titleFromSlug(slug), live: false }))
);

const liveCategories = new Set<CategoryId>(['text','developer','design','calculator','unit','date','security','geo']);
for (const tool of tools) tool.live = liveCategories.has(tool.category);

if (tools.length !== 400) throw new Error(`Controols catalog must contain exactly 400 tools, got ${tools.length}`);

export function getTool(slug: string) { return tools.find((tool) => tool.slug === slug); }
export function getCategory(id: string) { return categories.find((category) => category.id === id); }
export function getToolsByCategory(id: string) { return tools.filter((tool) => tool.category === id); }
