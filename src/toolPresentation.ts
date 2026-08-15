import type { Locale, Tool } from './data/catalog';
import { toolTitle as baseToolTitle } from './toolLocale';
import { expansionDescription, expansionLabel } from './data/expansionTools';

export function toolTitle(tool:Tool,locale:Locale){return expansionLabel(tool.slug,locale)||baseToolTitle(tool,locale)}

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
  es:{},zh:{},hi:{}
};

const generic:Record<Locale,(title:string)=>string>={
  en:t=>`${t} is a free online tool available in Controols and designed to run in the browser whenever possible.`,
  pt:t=>`${t} é uma ferramenta online gratuita da Controols, criada para funcionar no navegador sempre que possível.`,
  es:t=>`${t} es una herramienta online gratuita de Controols, diseñada para funcionar en el navegador siempre que sea posible.`,
  zh:t=>`${t} 是 Controols 提供的免费在线工具，并尽可能直接在浏览器中运行。`,
  hi:t=>`${t} Controols का मुफ़्त ऑनलाइन टूल है और जहाँ संभव हो सीधे ब्राउज़र में चलता है।`
};

export function toolDescription(tool:Tool,locale:Locale){
  const specific=expansionDescription(tool.slug,locale);
  if(specific)return specific;
  const title=toolTitle(tool,locale);
  const fn=categoryDescriptions[locale][tool.category]||categoryDescriptions.en[tool.category];
  return fn?fn(title):generic[locale](title);
}
