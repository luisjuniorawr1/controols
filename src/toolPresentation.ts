import type { Locale, Tool } from './data/catalog';
import { toolTitle as baseToolTitle } from './toolLocale';
import { expansionDescription, expansionLabel } from './data/expansionTools';

export function toolTitle(tool:Tool,locale:Locale){
  const expansion=(locale==='en'||locale==='pt')?expansionLabel(tool.slug,locale):undefined;
  return expansion||baseToolTitle(tool,locale);
}

const categoryDescriptions:Record<Locale,Record<string,(title:string)=>string>>={
  en:{
    image:t=>`${t} is a free browser tool for editing, converting or inspecting images without installing software.`,
    design:t=>`${t} helps you work with colors, dimensions and visual design values directly in your browser.`,
    pdf:t=>`${t} lets you work with PDF files online, with browser-side processing whenever possible.`,
    video:t=>`${t} helps you convert, adjust or inspect video files directly in the browser.`,
    audio:t=>`${t} helps you convert, edit or inspect audio files directly in the browser.`,
    text:t=>`${t} is a quick online text utility for cleaning, transforming or analyzing written content.`,
    developer:t=>`${t} is a browser-based developer utility for formatting, converting or inspecting technical data.`,
    data:t=>`${t} helps you transform, inspect or clean structured data such as CSV, JSON, XML and YAML.`,
    qr:t=>`${t} helps you create, read or work with QR codes and barcodes directly in the browser.`,
    calculator:t=>`${t} performs this calculation online with clear inputs and an instant result.`,
    unit:t=>`${t} converts values between common measurement units quickly in your browser.`,
    date:t=>`${t} helps calculate or convert dates and time values online.`,
    security:t=>`${t} provides a browser-based security or cryptography utility without requiring extra software.`,
    file:t=>`${t} helps inspect, convert or package files directly in your browser whenever possible.`,
    document:t=>`${t} helps format or transform document content online with a simple browser interface.`,
    geo:t=>`${t} helps calculate, convert or inspect geographic coordinates and distances.`,
    ai:t=>`${t} helps structure prompts and AI-ready instructions without requiring paid AI processing.`,
    webseo:t=>`${t} helps generate or inspect technical website and SEO elements for pages and shared links.`,
    print:t=>`${t} helps calculate print dimensions, resolution, material usage or production values.`,
    business:t=>`${t} provides a practical business or finance calculation for pricing, costs and performance.`,
    social:t=>`${t} helps prepare social-media content, dimensions, links or publishing structure.`
  },
  pt:{
    image:t=>`${t} é uma ferramenta gratuita para editar, converter ou analisar imagens diretamente no navegador.`,
    design:t=>`${t} ajuda a trabalhar com cores, medidas e valores de design diretamente no navegador.`,
    pdf:t=>`${t} permite trabalhar com arquivos PDF online, com processamento no navegador sempre que possível.`,
    video:t=>`${t} ajuda a converter, ajustar ou analisar vídeos diretamente no navegador.`,
    audio:t=>`${t} ajuda a converter, editar ou analisar arquivos de áudio diretamente no navegador.`,
    text:t=>`${t} é uma ferramenta rápida para limpar, transformar ou analisar textos online.`,
    developer:t=>`${t} é uma utilidade para desenvolvimento que formata, converte ou analisa dados técnicos no navegador.`,
    data:t=>`${t} ajuda a transformar, analisar ou limpar dados estruturados como CSV, JSON, XML e YAML.`,
    qr:t=>`${t} ajuda a criar, ler ou trabalhar com QR Codes e códigos de barras diretamente no navegador.`,
    calculator:t=>`${t} realiza esse cálculo online com campos claros e resultado imediato.`,
    unit:t=>`${t} converte valores entre unidades de medida de forma rápida diretamente no navegador.`,
    date:t=>`${t} ajuda a calcular ou converter datas e valores de tempo online.`,
    security:t=>`${t} oferece uma utilidade de segurança ou criptografia diretamente no navegador.`,
    file:t=>`${t} ajuda a analisar, converter ou organizar arquivos no navegador sempre que possível.`,
    document:t=>`${t} ajuda a formatar ou transformar conteúdo de documentos com uma interface simples.`,
    geo:t=>`${t} ajuda a calcular, converter ou analisar coordenadas e distâncias geográficas.`,
    ai:t=>`${t} ajuda a estruturar prompts e instruções para IA sem depender de processamento pago de inteligência artificial.`,
    webseo:t=>`${t} ajuda a gerar ou analisar elementos técnicos de sites, SEO e compartilhamento de links.`,
    print:t=>`${t} ajuda a calcular medidas, resolução, aproveitamento ou custos relacionados à produção gráfica.`,
    business:t=>`${t} oferece um cálculo prático para preços, custos, vendas e indicadores de negócios.`,
    social:t=>`${t} ajuda a preparar conteúdo, formatos, links e estrutura para redes sociais.`
  },
  es:{
    image:t=>`${t} es una herramienta gratuita para editar, convertir o analizar imágenes directamente en el navegador.`,
    design:t=>`${t} ayuda a trabajar con colores, medidas y valores de diseño directamente en el navegador.`,
    pdf:t=>`${t} permite trabajar con archivos PDF online, con procesamiento en el navegador siempre que sea posible.`,
    video:t=>`${t} ayuda a convertir, ajustar o analizar archivos de video directamente en el navegador.`,
    audio:t=>`${t} ayuda a convertir, editar o analizar archivos de audio directamente en el navegador.`,
    text:t=>`${t} es una utilidad rápida para limpiar, transformar o analizar texto online.`,
    developer:t=>`${t} es una utilidad para desarrollo que formatea, convierte o analiza datos técnicos en el navegador.`,
    data:t=>`${t} ayuda a transformar, analizar o limpiar datos estructurados como CSV, JSON, XML y YAML.`,
    qr:t=>`${t} ayuda a crear, leer o trabajar con códigos QR y códigos de barras directamente en el navegador.`,
    calculator:t=>`${t} realiza este cálculo online con campos claros y resultado inmediato.`,
    unit:t=>`${t} convierte valores entre unidades de medida comunes rápidamente en el navegador.`,
    date:t=>`${t} ayuda a calcular o convertir fechas y valores de tiempo online.`,
    security:t=>`${t} ofrece una utilidad de seguridad o criptografía directamente en el navegador.`,
    file:t=>`${t} ayuda a analizar, convertir u organizar archivos en el navegador siempre que sea posible.`,
    document:t=>`${t} ayuda a formatear o transformar contenido de documentos con una interfaz sencilla.`,
    geo:t=>`${t} ayuda a calcular, convertir o analizar coordenadas y distancias geográficas.`,
    ai:t=>`${t} ayuda a estructurar prompts e instrucciones para IA sin depender de procesamiento de IA de pago.`,
    webseo:t=>`${t} ayuda a generar o analizar elementos técnicos de sitios web, SEO y enlaces compartidos.`,
    print:t=>`${t} ayuda a calcular medidas, resolución, materiales o valores de producción gráfica.`,
    business:t=>`${t} ofrece un cálculo práctico de negocio o finanzas para precios, costes y rendimiento.`,
    social:t=>`${t} ayuda a preparar contenido, formatos, enlaces y estructura para redes sociales.`
  },
  zh:{
    image:t=>`${t} 是一款免费的浏览器图像编辑、转换或检查工具，无需安装软件。`,
    design:t=>`${t} 可直接在浏览器中处理颜色、尺寸和视觉设计数值。`,
    pdf:t=>`${t} 可在线处理 PDF 文件，并在技术允许时优先在浏览器本地完成处理。`,
    video:t=>`${t} 可直接在浏览器中转换、调整或检查视频文件。`,
    audio:t=>`${t} 可直接在浏览器中转换、编辑或检查音频文件。`,
    text:t=>`${t} 是一款用于清理、转换或分析文本的快速在线工具。`,
    developer:t=>`${t} 是一款浏览器开发工具，可格式化、转换或检查技术数据。`,
    data:t=>`${t} 可帮助转换、检查或清理 CSV、JSON、XML 和 YAML 等结构化数据。`,
    qr:t=>`${t} 可直接在浏览器中创建、读取或处理二维码和条形码。`,
    calculator:t=>`${t} 通过清晰的输入项在线完成计算并立即给出结果。`,
    unit:t=>`${t} 可在浏览器中快速转换常用计量单位。`,
    date:t=>`${t} 可在线计算或转换日期与时间数据。`,
    security:t=>`${t} 提供浏览器端安全或加密功能，无需额外安装软件。`,
    file:t=>`${t} 可在技术允许时直接在浏览器中检查、转换或打包文件。`,
    document:t=>`${t} 通过简洁的浏览器界面格式化或转换文档内容。`,
    geo:t=>`${t} 可计算、转换或检查地理坐标与距离。`,
    ai:t=>`${t} 可帮助组织提示词和 AI 指令，无需付费 AI 处理。`,
    webseo:t=>`${t} 可生成或检查网页、SEO 和链接分享所需的技术元素。`,
    print:t=>`${t} 可计算印刷尺寸、分辨率、材料用量或生产数值。`,
    business:t=>`${t} 提供与定价、成本和经营表现相关的实用商业或财务计算。`,
    social:t=>`${t} 可帮助准备社交媒体内容、尺寸、链接或发布结构。`
  },
  hi:{
    image:t=>`${t} ब्राउज़र में इमेज एडिट, कन्वर्ट या जाँचने का मुफ़्त टूल है, बिना सॉफ़्टवेयर इंस्टॉल किए।`,
    design:t=>`${t} ब्राउज़र में रंग, माप और विज़ुअल डिज़ाइन मानों के साथ काम करने में मदद करता है।`,
    pdf:t=>`${t} PDF फ़ाइलों पर ऑनलाइन काम करने देता है और जहाँ संभव हो प्रोसेसिंग ब्राउज़र में होती है।`,
    video:t=>`${t} वीडियो फ़ाइलों को ब्राउज़र में कन्वर्ट, एडजस्ट या जाँचने में मदद करता है।`,
    audio:t=>`${t} ऑडियो फ़ाइलों को ब्राउज़र में कन्वर्ट, एडिट या जाँचने में मदद करता है।`,
    text:t=>`${t} टेक्स्ट साफ़, बदलने या विश्लेषण करने की तेज़ ऑनलाइन यूटिलिटी है।`,
    developer:t=>`${t} तकनीकी डेटा को ब्राउज़र में फ़ॉर्मेट, कन्वर्ट या जाँचने की डेवलपर यूटिलिटी है।`,
    data:t=>`${t} CSV, JSON, XML और YAML जैसे स्ट्रक्चर्ड डेटा को बदलने, जाँचने या साफ़ करने में मदद करता है।`,
    qr:t=>`${t} ब्राउज़र में QR कोड और बारकोड बनाने, पढ़ने या उनके साथ काम करने में मदद करता है।`,
    calculator:t=>`${t} स्पष्ट इनपुट के साथ ऑनलाइन गणना करता है और तुरंत परिणाम देता है।`,
    unit:t=>`${t} सामान्य माप इकाइयों के बीच मानों को ब्राउज़र में तेजी से कन्वर्ट करता है।`,
    date:t=>`${t} तारीख और समय के मानों की ऑनलाइन गणना या कन्वर्ज़न में मदद करता है।`,
    security:t=>`${t} अतिरिक्त सॉफ़्टवेयर के बिना ब्राउज़र-आधारित सुरक्षा या क्रिप्टोग्राफी यूटिलिटी देता है।`,
    file:t=>`${t} जहाँ संभव हो फ़ाइलों को ब्राउज़र में जाँचने, कन्वर्ट करने या पैकेज करने में मदद करता है।`,
    document:t=>`${t} सरल ब्राउज़र इंटरफ़ेस से दस्तावेज़ सामग्री को फ़ॉर्मेट या बदलने में मदद करता है।`,
    geo:t=>`${t} भौगोलिक निर्देशांक और दूरियों की गणना, कन्वर्ज़न या जाँच में मदद करता है।`,
    ai:t=>`${t} पेड AI प्रोसेसिंग के बिना प्रॉम्प्ट और AI निर्देशों को व्यवस्थित करने में मदद करता है।`,
    webseo:t=>`${t} वेबसाइट, SEO और शेयर किए गए लिंक के तकनीकी तत्व बनाने या जाँचने में मदद करता है।`,
    print:t=>`${t} प्रिंट माप, रिज़ॉल्यूशन, सामग्री उपयोग या उत्पादन मानों की गणना में मदद करता है।`,
    business:t=>`${t} कीमत, लागत और प्रदर्शन के लिए उपयोगी बिज़नेस या वित्तीय गणना देता है।`,
    social:t=>`${t} सोशल मीडिया कंटेंट, आकार, लिंक और पब्लिशिंग संरचना तैयार करने में मदद करता है।`
  }
};

const generic:Record<Locale,(title:string)=>string>={
  en:t=>`${t} is a free online tool available in Controols and designed to run in the browser whenever possible.`,
  pt:t=>`${t} é uma ferramenta online gratuita da Controols, criada para funcionar no navegador sempre que possível.`,
  es:t=>`${t} es una herramienta online gratuita de Controols, diseñada para funcionar en el navegador siempre que sea posible.`,
  zh:t=>`${t} 是 Controols 提供的免费在线工具，并尽可能直接在浏览器中运行。`,
  hi:t=>`${t} Controols का मुफ़्त ऑनलाइन टूल है और जहाँ संभव हो सीधे ब्राउज़र में चलता है।`
};

export function toolDescription(tool:Tool,locale:Locale){
  const specific=(locale==='en'||locale==='pt')?expansionDescription(tool.slug,locale):undefined;
  if(specific)return specific;
  const title=toolTitle(tool,locale);
  const fn=categoryDescriptions[locale][tool.category];
  return fn?fn(title):generic[locale](title);
}
