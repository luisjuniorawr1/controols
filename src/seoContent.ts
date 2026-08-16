import type { Locale, Tool } from './data/catalog';

export type SeoFaq = { question: string; answer: string };

const groupByCategory: Record<string, 'media'|'text'|'creative'|'calculate'|'qr'> = {
  image:'media', pdf:'media', video:'media', audio:'media', file:'media', document:'media',
  text:'text', developer:'text', data:'text', security:'text', webseo:'text',
  design:'creative', print:'creative', social:'creative', ai:'creative',
  calculator:'calculate', unit:'calculate', date:'calculate', geo:'calculate', business:'calculate',
  qr:'qr'
};

const ui: Record<Locale, {
  howTo:(title:string)=>string;
  howIntro:(title:string)=>string;
  steps:[string,string,string];
  stepText:[(title:string)=>string,(title:string)=>string,(title:string)=>string];
  uses:string;
  privacy:string;
  privacyText:string;
  faq:string;
  faqQuestions:[(title:string)=>string,(title:string)=>string,(title:string)=>string];
  faqAnswers:[(title:string)=>string,(title:string)=>string,(title:string)=>string];
  categoryMeta:(label:string,count:number)=>string;
  categoryHeading:(label:string)=>string;
  categoryIntro:(label:string,count:number)=>string;
  categorySecond:(label:string)=>string;
  popular:string;
}> = {
  en:{
    howTo:t=>`How to use ${t}`,
    howIntro:t=>`${t} is designed for a quick browser workflow. Use the tool above, review the result and only download or copy what you need.`,
    steps:['Add your input','Adjust the options','Review the result'],
    stepText:[t=>`Choose the file, text or values requested by ${t}.`,t=>`Set the available options for the result you want.`,t=>`Run the tool, check the output and save or copy the result when it is ready.`],
    uses:'When this tool is useful',privacy:'Privacy and browser processing',privacyText:'Controols is browser-first. Whenever the feature can run locally, your files and input stay on your device instead of being uploaded to an application server.',faq:'Frequently asked questions',
    faqQuestions:[t=>`Is ${t} free?`,t=>`Do I need to install anything to use ${t}?`,t=>`Are my files or data uploaded?`],
    faqAnswers:[()=>`Yes. Controols tools are available to use for free in the browser.`,()=>`No. The tool is designed to run in a modern web browser without installing desktop software.`,()=>`Whenever technically possible, processing happens locally in your browser. Some browser capabilities and file formats can vary by device.`],
    categoryMeta:(l,c)=>`${c} free ${l} tools for common online tasks, with browser-side processing whenever possible.`,categoryHeading:l=>`Free ${l} tools online`,categoryIntro:(l,c)=>`Explore ${c} ${l} tools for everyday digital work. Each utility has its own page, clear inputs and a direct result in the browser.`,categorySecond:l=>`Use the ${l} collection to move from a specific task to related utilities without installing extra software. The pages are connected so you can quickly continue with the next step in your workflow.`,popular:'Popular tools in this category'
  },
  pt:{
    howTo:t=>`Como usar ${t}`,
    howIntro:t=>`${t} foi criada para um fluxo rápido no navegador. Use a ferramenta acima, confira o resultado e baixe ou copie apenas o que precisar.`,
    steps:['Adicione os dados','Ajuste as opções','Confira o resultado'],
    stepText:[t=>`Escolha o arquivo, texto ou valores solicitados por ${t}.`,t=>`Defina as opções disponíveis de acordo com o resultado que você deseja.`,t=>`Execute a ferramenta, confira a saída e salve ou copie o resultado quando estiver pronto.`],
    uses:'Quando esta ferramenta é útil',privacy:'Privacidade e processamento no navegador',privacyText:'A Controols prioriza o processamento no navegador. Sempre que a função puder rodar localmente, seus arquivos e dados permanecem no seu dispositivo em vez de serem enviados para um servidor da aplicação.',faq:'Perguntas frequentes',
    faqQuestions:[t=>`${t} é grátis?`,t=>`Preciso instalar algo para usar ${t}?`,t=>`Meus arquivos ou dados são enviados para algum servidor?`],
    faqAnswers:[()=>`Sim. As ferramentas da Controols podem ser usadas gratuitamente no navegador.`,()=>`Não. A ferramenta foi criada para funcionar em navegadores modernos sem instalar um programa no computador.`,()=>`Sempre que tecnicamente possível, o processamento acontece localmente no navegador. O suporte pode variar conforme o dispositivo e o formato do arquivo.`],
    categoryMeta:(l,c)=>`${c} ferramentas gratuitas de ${l} para tarefas online, com processamento no navegador sempre que possível.`,categoryHeading:l=>`Ferramentas de ${l} online e grátis`,categoryIntro:(l,c)=>`Explore ${c} ferramentas de ${l} para tarefas digitais do dia a dia. Cada utilidade tem uma página própria, campos claros e resultado direto no navegador.`,categorySecond:l=>`Use a categoria ${l} para sair de uma tarefa específica e continuar em ferramentas relacionadas sem instalar programas extras. As páginas são conectadas para facilitar o próximo passo do seu fluxo.`,popular:'Ferramentas em destaque nesta categoria'
  },
  es:{
    howTo:t=>`Cómo usar ${t}`,
    howIntro:t=>`${t} está diseñada para un flujo rápido en el navegador. Usa la herramienta, revisa el resultado y descarga o copia solo lo que necesites.`,
    steps:['Añade los datos','Ajusta las opciones','Revisa el resultado'],
    stepText:[t=>`Selecciona el archivo, texto o valores que solicita ${t}.`,t=>`Configura las opciones disponibles según el resultado que necesitas.`,t=>`Ejecuta la herramienta, revisa la salida y guarda o copia el resultado cuando esté listo.`],
    uses:'Cuándo resulta útil esta herramienta',privacy:'Privacidad y procesamiento en el navegador',privacyText:'Controols prioriza el procesamiento en el navegador. Siempre que la función pueda ejecutarse localmente, tus archivos y datos permanecen en tu dispositivo en lugar de enviarse a un servidor de la aplicación.',faq:'Preguntas frecuentes',
    faqQuestions:[t=>`¿${t} es gratis?`,t=>`¿Necesito instalar algo para usar ${t}?`,t=>`¿Se suben mis archivos o datos a un servidor?`],
    faqAnswers:[()=>`Sí. Las herramientas de Controols se pueden usar gratis en el navegador.`,()=>`No. La herramienta está diseñada para funcionar en navegadores modernos sin instalar software de escritorio.`,()=>`Siempre que sea técnicamente posible, el procesamiento ocurre localmente en tu navegador. La compatibilidad puede variar según el dispositivo y el formato.`],
    categoryMeta:(l,c)=>`${c} herramientas gratuitas de ${l} para tareas online, con procesamiento local siempre que sea posible.`,categoryHeading:l=>`Herramientas de ${l} online y gratis`,categoryIntro:(l,c)=>`Explora ${c} herramientas de ${l} para tareas digitales habituales. Cada utilidad tiene su propia página, entradas claras y un resultado directo en el navegador.`,categorySecond:l=>`Usa la categoría ${l} para pasar de una tarea concreta a utilidades relacionadas sin instalar software adicional. Las páginas están conectadas para facilitar el siguiente paso de tu flujo de trabajo.`,popular:'Herramientas destacadas de esta categoría'
  },
  zh:{
    howTo:t=>`如何使用${t}`,
    howIntro:t=>`${t}专为浏览器中的快速操作而设计。使用上方工具，检查结果，只下载或复制你真正需要的内容。`,
    steps:['添加输入内容','调整选项','检查结果'],
    stepText:[t=>`选择${t}所需的文件、文本或数值。`,t=>`根据你想要的结果设置可用选项。`,t=>`运行工具，检查输出，并在完成后保存或复制结果。`],
    uses:'适合使用此工具的场景',privacy:'隐私与浏览器本地处理',privacyText:'Controols 优先采用浏览器本地处理。只要技术条件允许，你的文件和输入数据都会留在设备上，而不会上传到应用服务器。',faq:'常见问题',
    faqQuestions:[t=>`${t}可以免费使用吗？`,t=>`使用${t}需要安装软件吗？`,t=>`我的文件或数据会被上传吗？`],
    faqAnswers:[()=>`可以。Controols 的工具可在浏览器中免费使用。`,()=>`不需要。该工具面向现代浏览器设计，无需安装桌面软件。`,()=>`只要技术上可行，处理会在你的浏览器本地完成。不同设备和文件格式的支持情况可能有所不同。`],
    categoryMeta:(l,c)=>`${c} 个免费的${l}在线工具，尽可能在浏览器本地完成处理。`,categoryHeading:l=>`免费的${l}在线工具`,categoryIntro:(l,c)=>`浏览 ${c} 个${l}工具，处理常见数字任务。每个工具都有独立页面、清晰输入项，并可直接在浏览器中获得结果。`,categorySecond:l=>`通过${l}分类，你可以从当前任务快速继续到相关工具，无需安装额外软件。页面之间的关联可以帮助你顺畅完成下一步。`,popular:'此分类中的常用工具'
  },
  hi:{
    howTo:t=>`${t} का उपयोग कैसे करें`,
    howIntro:t=>`${t} को ब्राउज़र में तेज़ और सरल कार्यप्रवाह के लिए बनाया गया है। ऊपर दिए टूल का उपयोग करें, परिणाम जाँचें और केवल वही डाउनलोड या कॉपी करें जिसकी जरूरत हो।`,
    steps:['इनपुट जोड़ें','विकल्प समायोजित करें','परिणाम जाँचें'],
    stepText:[t=>`${t} के लिए आवश्यक फ़ाइल, टेक्स्ट या मान चुनें।`,t=>`अपनी जरूरत के परिणाम के अनुसार उपलब्ध विकल्प सेट करें।`,t=>`टूल चलाएँ, आउटपुट जाँचें और तैयार होने पर परिणाम सेव या कॉपी करें।`],
    uses:'यह टूल कब उपयोगी है',privacy:'गोपनीयता और ब्राउज़र प्रोसेसिंग',privacyText:'Controols ब्राउज़र-फर्स्ट है। जहाँ तकनीकी रूप से संभव हो, आपकी फ़ाइलें और इनपुट एप्लिकेशन सर्वर पर अपलोड होने के बजाय आपके डिवाइस पर ही प्रोसेस होते हैं।',faq:'अक्सर पूछे जाने वाले सवाल',
    faqQuestions:[t=>`क्या ${t} मुफ़्त है?`,t=>`क्या ${t} इस्तेमाल करने के लिए कुछ इंस्टॉल करना होगा?`,t=>`क्या मेरी फ़ाइलें या डेटा अपलोड किए जाते हैं?`],
    faqAnswers:[()=>`हाँ। Controols के टूल ब्राउज़र में मुफ़्त उपयोग के लिए उपलब्ध हैं।`,()=>`नहीं। यह टूल आधुनिक वेब ब्राउज़र में बिना डेस्कटॉप सॉफ़्टवेयर इंस्टॉल किए चलने के लिए बनाया गया है।`,()=>`जहाँ तकनीकी रूप से संभव हो, प्रोसेसिंग आपके ब्राउज़र में स्थानीय रूप से होती है। डिवाइस और फ़ाइल फ़ॉर्मेट के अनुसार सपोर्ट अलग हो सकता है।`],
    categoryMeta:(l,c)=>`${l} के लिए ${c} मुफ़्त ऑनलाइन टूल, जहाँ संभव हो ब्राउज़र में स्थानीय प्रोसेसिंग के साथ।`,categoryHeading:l=>`${l} के मुफ़्त ऑनलाइन टूल`,categoryIntro:(l,c)=>`रोज़मर्रा के डिजिटल काम के लिए ${l} के ${c} टूल देखें। हर यूटिलिटी का अपना पेज, स्पष्ट इनपुट और ब्राउज़र में सीधा परिणाम है।`,categorySecond:l=>`${l} श्रेणी से किसी खास काम के बाद संबंधित टूल पर जल्दी जाएँ, बिना अतिरिक्त सॉफ़्टवेयर इंस्टॉल किए। जुड़े हुए पेज आपके अगले चरण को आसान बनाते हैं।`,popular:'इस श्रेणी के प्रमुख टूल'
  }
};

const uses: Record<Locale, Record<'media'|'text'|'creative'|'calculate'|'qr', string[]>> = {
  en:{
    media:['Prepare a file for sharing, publishing or storage.','Convert or adjust content without opening a desktop editor.','Continue the workflow with related file and media tools.'],
    text:['Clean, inspect or transform content before publishing or development.','Check structured values quickly without setting up a local script.','Copy the result into another document, app or workflow.'],
    creative:['Prepare content, dimensions or structured ideas for production.','Speed up repetitive design, publishing and campaign tasks.','Generate a practical starting point that can be refined in your normal workflow.'],
    calculate:['Get a quick result from clearly defined values.','Compare scenarios without building a spreadsheet first.','Reuse the result in planning, budgeting or everyday decisions.'],
    qr:['Create or inspect a code for sharing information quickly.','Prepare a browser-generated result for print or digital use.','Move between QR and barcode utilities from the same category.']
  },
  pt:{
    media:['Preparar um arquivo para compartilhar, publicar ou armazenar.','Converter ou ajustar conteúdo sem abrir um editor instalado.','Continuar o fluxo com outras ferramentas de arquivos e mídia.'],
    text:['Limpar, analisar ou transformar conteúdo antes de publicar ou desenvolver.','Conferir dados estruturados rapidamente sem montar um script local.','Copiar o resultado para outro documento, aplicativo ou fluxo.'],
    creative:['Preparar conteúdo, medidas ou ideias estruturadas para produção.','Acelerar tarefas repetitivas de design, publicação e campanhas.','Criar um ponto de partida prático para refinar no seu fluxo normal.'],
    calculate:['Obter um resultado rápido a partir de valores definidos.','Comparar cenários sem precisar montar uma planilha primeiro.','Reaproveitar o resultado em planejamento, orçamento ou decisões do dia a dia.'],
    qr:['Criar ou analisar um código para compartilhar informações rapidamente.','Preparar um resultado gerado no navegador para uso impresso ou digital.','Alternar entre ferramentas de QR e código de barras da mesma categoria.']
  },
  es:{
    media:['Preparar un archivo para compartir, publicar o almacenar.','Convertir o ajustar contenido sin abrir un editor de escritorio.','Continuar el flujo con otras herramientas de archivos y medios.'],
    text:['Limpiar, analizar o transformar contenido antes de publicar o desarrollar.','Revisar datos estructurados rápidamente sin crear un script local.','Copiar el resultado a otro documento, aplicación o flujo.'],
    creative:['Preparar contenido, medidas o ideas estructuradas para producción.','Acelerar tareas repetitivas de diseño, publicación y campañas.','Crear un punto de partida práctico para refinar en tu flujo habitual.'],
    calculate:['Obtener un resultado rápido a partir de valores definidos.','Comparar escenarios sin crear primero una hoja de cálculo.','Reutilizar el resultado en planificación, presupuesto o decisiones cotidianas.'],
    qr:['Crear o analizar un código para compartir información rápidamente.','Preparar un resultado generado en el navegador para uso impreso o digital.','Cambiar entre herramientas QR y de códigos de barras de la misma categoría.']
  },
  zh:{
    media:['为分享、发布或存储准备文件。','无需打开桌面编辑器即可转换或调整内容。','使用相关文件和媒体工具继续后续流程。'],
    text:['在发布或开发前清理、检查或转换内容。','无需编写本地脚本即可快速检查结构化数据。','把结果复制到其他文档、应用或工作流程中。'],
    creative:['为制作准备内容、尺寸或结构化创意。','加快设计、发布和营销活动中的重复任务。','生成一个实用起点，再在日常流程中继续完善。'],
    calculate:['根据明确输入快速获得计算结果。','无需先创建电子表格即可比较不同场景。','将结果用于规划、预算或日常决策。'],
    qr:['创建或检查代码以快速分享信息。','生成适合印刷或数字用途的浏览器结果。','在同一分类中继续使用二维码和条形码工具。']
  },
  hi:{
    media:['फ़ाइल को शेयर, प्रकाशित या स्टोर करने के लिए तैयार करें।','डेस्कटॉप एडिटर खोले बिना कंटेंट कन्वर्ट या एडजस्ट करें।','संबंधित फ़ाइल और मीडिया टूल के साथ आगे का काम जारी रखें।'],
    text:['प्रकाशन या डेवलपमेंट से पहले कंटेंट साफ़, जाँच या ट्रांसफ़ॉर्म करें।','लोकल स्क्रिप्ट बनाए बिना स्ट्रक्चर्ड डेटा जल्दी जाँचें।','परिणाम को दूसरे दस्तावेज़, ऐप या वर्कफ़्लो में कॉपी करें।'],
    creative:['प्रोडक्शन के लिए कंटेंट, माप या स्ट्रक्चर्ड आइडिया तैयार करें।','डिज़ाइन, पब्लिशिंग और कैंपेन के दोहराए जाने वाले काम तेज़ करें।','एक उपयोगी शुरुआती आउटपुट बनाएँ जिसे अपने सामान्य वर्कफ़्लो में बेहतर किया जा सके।'],
    calculate:['स्पष्ट मानों से तुरंत परिणाम पाएँ।','पहले स्प्रेडशीट बनाए बिना अलग-अलग परिदृश्यों की तुलना करें।','परिणाम को योजना, बजट या रोज़मर्रा के फैसलों में उपयोग करें।'],
    qr:['जानकारी जल्दी साझा करने के लिए कोड बनाएँ या जाँचें।','प्रिंट या डिजिटल उपयोग के लिए ब्राउज़र में परिणाम तैयार करें।','उसी श्रेणी के QR और बारकोड टूल के बीच आसानी से जाएँ।']
  }
};

export function toolSeoContent(tool:Tool, title:string, locale:Locale) {
  const t=ui[locale];
  const group=groupByCategory[tool.category]||'text';
  const faqs:SeoFaq[]=t.faqQuestions.map((question,index)=>({question:question(title),answer:t.faqAnswers[index](title)}));
  return {
    howToHeading:t.howTo(title),howToIntro:t.howIntro(title),
    steps:t.steps.map((step,index)=>({title:step,text:t.stepText[index](title)})),
    usesHeading:t.uses,useCases:uses[locale][group],
    privacyHeading:t.privacy,privacyText:t.privacyText,faqHeading:t.faq,faqs
  };
}

export function categorySeoContent(label:string,count:number,locale:Locale){
  const t=ui[locale];
  return {meta:t.categoryMeta(label,count),heading:t.categoryHeading(label),intro:t.categoryIntro(label,count),second:t.categorySecond(label),popular:t.popular};
}

export function safeContentDate(value:string, now=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const map=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  const today=`${map.year}-${map.month}-${map.day}`;
  return value>today?today:value;
}
