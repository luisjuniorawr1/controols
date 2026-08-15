import type { CategoryId, Locale } from './extendedCatalog';

export type CollectionId='image-design'|'pdf-files'|'video-audio'|'text-data'|'dev-security'|'calculations-utilities';
export type Collection={id:CollectionId;categories:CategoryId[];labels:Record<Locale,string>;descriptions:Record<Locale,string>;eyebrow:Record<Locale,string>};

export const collections:Collection[]=[
  {
    id:'image-design',categories:['image','design'],
    labels:{en:'Image & Design',pt:'Imagem e Design',es:'Imagen y Diseño',zh:'图像与设计',hi:'इमेज और डिज़ाइन'},
    eyebrow:{en:'Create, edit and transform',pt:'Crie, edite e transforme',es:'Crea, edita y transforma',zh:'创建、编辑与转换',hi:'बनाएँ, संपादित करें और बदलें'},
    descriptions:{en:'Resize, compress, convert, crop, enhance and work with colors and graphics.',pt:'Redimensione, comprima, converta, recorte, ajuste cores e trabalhe com elementos visuais.',es:'Redimensiona, comprime, convierte, recorta, ajusta colores y trabaja con elementos visuales.',zh:'调整尺寸、压缩、转换、裁剪、优化颜色和处理图形。',hi:'आकार बदलें, कंप्रेस करें, कन्वर्ट करें, क्रॉप करें और रंग व ग्राफिक्स पर काम करें।'}
  },
  {
    id:'pdf-files',categories:['pdf','document','file'],
    labels:{en:'PDF & Files',pt:'PDF e Arquivos',es:'PDF y Archivos',zh:'PDF 与文件',hi:'PDF और फ़ाइलें'},
    eyebrow:{en:'Organize documents',pt:'Organize documentos',es:'Organiza documentos',zh:'整理文档',hi:'दस्तावेज़ व्यवस्थित करें'},
    descriptions:{en:'Merge, split, protect, convert, extract and organize PDFs and everyday files.',pt:'Junte, divida, proteja, converta, extraia e organize PDFs e arquivos do dia a dia.',es:'Une, divide, protege, convierte, extrae y organiza PDFs y archivos cotidianos.',zh:'合并、拆分、保护、转换、提取和整理 PDF 与常用文件。',hi:'PDF और रोज़मर्रा की फ़ाइलों को जोड़ें, बाँटें, सुरक्षित करें, कन्वर्ट और व्यवस्थित करें।'}
  },
  {
    id:'video-audio',categories:['video','audio'],
    labels:{en:'Video & Audio',pt:'Vídeo e Áudio',es:'Video y Audio',zh:'视频与音频',hi:'वीडियो और ऑडियो'},
    eyebrow:{en:'Convert and adjust media',pt:'Converta e ajuste mídias',es:'Convierte y ajusta medios',zh:'转换与调整媒体',hi:'मीडिया कन्वर्ट और एडजस्ट करें'},
    descriptions:{en:'Convert formats, trim, resize, extract audio and prepare media directly in your browser.',pt:'Converta formatos, corte, redimensione, extraia áudio e prepare mídias direto no navegador.',es:'Convierte formatos, recorta, redimensiona, extrae audio y prepara medios en el navegador.',zh:'在浏览器中转换格式、裁剪、缩放、提取音频和处理媒体。',hi:'ब्राउज़र में फॉर्मेट बदलें, ट्रिम करें, आकार बदलें और ऑडियो निकालें।'}
  },
  {
    id:'text-data',categories:['text','data'],
    labels:{en:'Text & Data',pt:'Texto e Dados',es:'Texto y Datos',zh:'文本与数据',hi:'टेक्स्ट और डेटा'},
    eyebrow:{en:'Clean, format and transform',pt:'Limpe, formate e transforme',es:'Limpia, formatea y transforma',zh:'清理、格式化与转换',hi:'साफ़, फ़ॉर्मेट और बदलें'},
    descriptions:{en:'Count, compare, clean and transform text, CSV, JSON, XML, YAML and tabular data.',pt:'Conte, compare, limpe e transforme textos, CSV, JSON, XML, YAML e dados tabulares.',es:'Cuenta, compara, limpia y transforma textos, CSV, JSON, XML, YAML y datos tabulares.',zh:'统计、比较、清理和转换文本、CSV、JSON、XML、YAML 与表格数据。',hi:'टेक्स्ट, CSV, JSON, XML, YAML और टेबल डेटा को गिनें, साफ़ और बदलें।'}
  },
  {
    id:'dev-security',categories:['developer','security','qr'],
    labels:{en:'Dev & Security',pt:'Dev e Segurança',es:'Dev y Seguridad',zh:'开发与安全',hi:'डेव और सुरक्षा'},
    eyebrow:{en:'Build, inspect and protect',pt:'Construa, inspecione e proteja',es:'Construye, inspecciona y protege',zh:'构建、检查与保护',hi:'बनाएँ, जाँचें और सुरक्षित करें'},
    descriptions:{en:'Format code, inspect tokens, generate hashes, QR codes, passwords and developer utilities.',pt:'Formate código, inspecione tokens, gere hashes, QR Codes, senhas e utilidades para desenvolvimento.',es:'Formatea código, inspecciona tokens, genera hashes, códigos QR, contraseñas y utilidades.',zh:'格式化代码、检查令牌、生成哈希、二维码、密码和开发工具。',hi:'कोड फ़ॉर्मेट करें, टोकन जाँचें, हैश, QR कोड, पासवर्ड और डेवलपर टूल बनाएँ।'}
  },
  {
    id:'calculations-utilities',categories:['calculator','unit','date','geo'],
    labels:{en:'Calculators & Utilities',pt:'Cálculos e Utilidades',es:'Cálculos y Utilidades',zh:'计算与实用工具',hi:'कैलकुलेटर और यूटिलिटीज'},
    eyebrow:{en:'Calculate and convert quickly',pt:'Calcule e converta rápido',es:'Calcula y convierte rápido',zh:'快速计算与转换',hi:'तेज़ी से गणना और कन्वर्ट करें'},
    descriptions:{en:'Percentages, averages, dates, units, coordinates and practical everyday calculations.',pt:'Porcentagens, médias, datas, unidades, coordenadas e cálculos práticos para o dia a dia.',es:'Porcentajes, medias, fechas, unidades, coordenadas y cálculos prácticos del día a día.',zh:'百分比、平均值、日期、单位、坐标和日常实用计算。',hi:'प्रतिशत, औसत, तारीखें, इकाइयाँ, निर्देशांक और रोज़मर्रा की उपयोगी गणनाएँ।'}
  }
];

export function getCollection(id:string){return collections.find(collection=>collection.id===id);}
