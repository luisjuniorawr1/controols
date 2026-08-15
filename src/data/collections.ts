import type { CategoryId, Locale } from './extendedCatalog';

export type CollectionId='image-design'|'pdf-files'|'video-audio'|'text-data'|'dev-security'|'calculations-utilities'|'ai-prompts'|'web-seo';
export type Collection={id:CollectionId;categories:CategoryId[];labels:Record<Locale,string>;descriptions:Record<Locale,string>;eyebrow:Record<Locale,string>};
const category=(id:string)=>id as CategoryId;

export const collections:Collection[]=[
  {
    id:'image-design',categories:[category('image'),category('design'),category('print'),category('social')],
    labels:{en:'Image & Design',pt:'Imagem e Design',es:'Imagen y Diseño',zh:'图像与设计',hi:'इमेज और डिज़ाइन'},
    eyebrow:{en:'Create, edit and publish',pt:'Crie, edite e publique',es:'Crea, edita y publica',zh:'创建、编辑与发布',hi:'बनाएँ, संपादित करें और प्रकाशित करें'},
    descriptions:{en:'Work with images, colors, print production and creator-ready social formats.',pt:'Trabalhe com imagens, cores, produção gráfica e formatos prontos para redes sociais.',es:'Trabaja con imágenes, colores, producción gráfica y formatos para redes sociales.',zh:'处理图像、颜色、印刷制作和社交媒体内容格式。',hi:'इमेज, रंग, प्रिंट प्रोडक्शन और सोशल मीडिया फ़ॉर्मैट पर काम करें।'}
  },
  {
    id:'pdf-files',categories:[category('pdf'),category('document'),category('file')],
    labels:{en:'PDF & Files',pt:'PDF e Arquivos',es:'PDF y Archivos',zh:'PDF 与文件',hi:'PDF और फ़ाइलें'},
    eyebrow:{en:'Organize documents',pt:'Organize documentos',es:'Organiza documentos',zh:'整理文档',hi:'दस्तावेज़ व्यवस्थित करें'},
    descriptions:{en:'Merge, split, protect, convert, extract and organize PDFs and everyday files.',pt:'Junte, divida, proteja, converta, extraia e organize PDFs e arquivos do dia a dia.',es:'Une, divide, protege, convierte, extrae y organiza PDFs y archivos cotidianos.',zh:'合并、拆分、保护、转换、提取和整理 PDF 与常用文件。',hi:'PDF और रोज़मर्रा की फ़ाइलों को जोड़ें, बाँटें, सुरक्षित करें, कन्वर्ट और व्यवस्थित करें।'}
  },
  {
    id:'video-audio',categories:[category('video'),category('audio')],
    labels:{en:'Video & Audio',pt:'Vídeo e Áudio',es:'Video y Audio',zh:'视频与音频',hi:'वीडियो और ऑडियो'},
    eyebrow:{en:'Convert and adjust media',pt:'Converta e ajuste mídias',es:'Convierte y ajusta medios',zh:'转换与调整媒体',hi:'मीडिया कन्वर्ट और एडजस्ट करें'},
    descriptions:{en:'Convert formats, trim, resize, extract audio and prepare media directly in your browser.',pt:'Converta formatos, corte, redimensione, extraia áudio e prepare mídias direto no navegador.',es:'Convierte formatos, recorta, redimensiona, extrae audio y prepara medios en el navegador.',zh:'在浏览器中转换格式、裁剪、缩放、提取音频和处理媒体。',hi:'ब्राउज़र में फॉर्मेट बदलें, ट्रिम करें, आकार बदलें और ऑडियो निकालें।'}
  },
  {
    id:'text-data',categories:[category('text'),category('data')],
    labels:{en:'Text & Data',pt:'Texto e Dados',es:'Texto y Datos',zh:'文本与数据',hi:'टेक्स्ट और डेटा'},
    eyebrow:{en:'Clean, format and transform',pt:'Limpe, formate e transforme',es:'Limpia, formatea y transforma',zh:'清理、格式化与转换',hi:'साफ़, फ़ॉर्मेट और बदलें'},
    descriptions:{en:'Count, compare, clean and transform text, CSV, JSON, XML, YAML and tabular data.',pt:'Conte, compare, limpe e transforme textos, CSV, JSON, XML, YAML e dados tabulares.',es:'Cuenta, compara, limpia y transforma textos, CSV, JSON, XML, YAML y datos tabulares.',zh:'统计、比较、清理和转换文本、CSV、JSON、XML、YAML 与表格数据。',hi:'टेक्स्ट, CSV, JSON, XML, YAML और टेबल डेटा को गिनें, साफ़ और बदलें।'}
  },
  {
    id:'dev-security',categories:[category('developer'),category('security'),category('qr')],
    labels:{en:'Dev & Security',pt:'Dev e Segurança',es:'Dev y Seguridad',zh:'开发与安全',hi:'डेव और सुरक्षा'},
    eyebrow:{en:'Build, inspect and protect',pt:'Construa, inspecione e proteja',es:'Construye, inspecciona y protege',zh:'构建、检查与保护',hi:'बनाएँ, जाँचें और सुरक्षित करें'},
    descriptions:{en:'Format code, inspect tokens, generate hashes, QR codes, passwords and developer utilities.',pt:'Formate código, inspecione tokens, gere hashes, QR Codes, senhas e utilidades para desenvolvimento.',es:'Formatea código, inspecciona tokens, genera hashes, códigos QR, contraseñas y utilidades.',zh:'格式化代码、检查令牌、生成哈希、二维码、密码和开发工具。',hi:'कोड फ़ॉर्मेट करें, टोकन जाँचें, हैश, QR कोड, पासवर्ड और डेवलपर टूल बनाएँ।'}
  },
  {
    id:'calculations-utilities',categories:[category('calculator'),category('unit'),category('date'),category('geo'),category('business')],
    labels:{en:'Calculators & Utilities',pt:'Cálculos e Utilidades',es:'Cálculos y Utilidades',zh:'计算与实用工具',hi:'कैलकुलेटर और यूटिलिटीज'},
    eyebrow:{en:'Calculate, convert and plan',pt:'Calcule, converta e planeje',es:'Calcula, convierte y planifica',zh:'计算、转换与规划',hi:'गणना, कन्वर्ट और योजना बनाएँ'},
    descriptions:{en:'Percentages, dates, units, coordinates plus practical business and finance calculations.',pt:'Porcentagens, datas, unidades, coordenadas e cálculos práticos de negócios e finanças.',es:'Porcentajes, fechas, unidades, coordenadas y cálculos prácticos de negocios y finanzas.',zh:'百分比、日期、单位、坐标以及实用的商业和财务计算。',hi:'प्रतिशत, तारीखें, इकाइयाँ, निर्देशांक और उपयोगी बिज़नेस व फ़ाइनेंस गणनाएँ।'}
  },
  {
    id:'ai-prompts',categories:[category('ai')],
    labels:{en:'AI & Prompts',pt:'IA e Prompts',es:'IA y Prompts',zh:'AI 与提示词',hi:'AI और प्रॉम्प्ट'},
    eyebrow:{en:'Controols Labs · structure better instructions',pt:'Controols Labs · estruture melhores instruções',es:'Controols Labs · estructura mejores instrucciones',zh:'Controols Labs · 构建更好的提示词',hi:'Controols Labs · बेहतर निर्देश बनाएँ'},
    descriptions:{en:'Build prompts, reusable templates, personas and token estimates without paid AI processing.',pt:'Monte prompts, templates reutilizáveis, personas e estimativas de tokens sem depender de processamento pago de IA.',es:'Crea prompts, plantillas reutilizables, personas y estimaciones de tokens sin procesamiento de IA de pago.',zh:'无需付费 AI 处理即可构建提示词、模板、角色和 token 估算。',hi:'पेड AI प्रोसेसिंग के बिना प्रॉम्प्ट, टेम्पलेट, पर्सोना और टोकन अनुमान बनाएँ।'}
  },
  {
    id:'web-seo',categories:[category('webseo')],
    labels:{en:'Web & SEO',pt:'Web e SEO',es:'Web y SEO',zh:'网站与 SEO',hi:'वेब और SEO'},
    eyebrow:{en:'Optimize pages and sharing',pt:'Otimize páginas e compartilhamentos',es:'Optimiza páginas y enlaces',zh:'优化页面与分享',hi:'पेज और शेयरिंग बेहतर करें'},
    descriptions:{en:'Generate metadata, structured data, sitemaps, UTM links and inspect essential on-page SEO elements.',pt:'Gere metadados, dados estruturados, sitemaps, links UTM e analise elementos essenciais de SEO on-page.',es:'Genera metadatos, datos estructurados, sitemaps, enlaces UTM y analiza elementos SEO on-page.',zh:'生成元数据、结构化数据、站点地图、UTM 链接并检查页面 SEO。',hi:'मेटाडेटा, स्ट्रक्चर्ड डेटा, साइटमैप, UTM लिंक बनाएँ और on-page SEO जाँचें।'}
  }
];

export function getCollection(id:string){return collections.find(collection=>collection.id===id);}
