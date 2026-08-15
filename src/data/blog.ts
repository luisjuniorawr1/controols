import type { Locale } from './catalog';

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogTranslation = {
  slug: string;
  title: string;
  description: string;
  category: string;
  alt: string;
  intro: string;
  sections: BlogSection[];
  conclusion: string;
};

export type BlogPost = {
  id: string;
  cover: string;
  publishedAt: string;
  updatedAt: string;
  relatedTools: string[];
  translations: Record<Locale, BlogTranslation>;
};

export const blogUi: Record<Locale, {
  eyebrow: string;
  title: string;
  description: string;
  latest: string;
  readArticle: string;
  back: string;
  relatedTools: string;
  relatedPosts: string;
  useTool: string;
  published: string;
  updated: string;
  freeBrowserTools: string;
}> = {
  en: {
    eyebrow: 'CONTROOLS BLOG',
    title: 'Practical guides for files, design and everyday digital work.',
    description: 'Clear explanations, useful comparisons and step-by-step ideas connected to free tools you can use directly in your browser.',
    latest: 'Latest articles',
    readArticle: 'Read article',
    back: 'Back to Blog',
    relatedTools: 'Tools related to this guide',
    relatedPosts: 'Keep reading',
    useTool: 'Open tool',
    published: 'Published',
    updated: 'Updated',
    freeBrowserTools: 'Free browser tools'
  },
  pt: {
    eyebrow: 'BLOG CONTROOLS',
    title: 'Guias práticos para arquivos, design e trabalho digital.',
    description: 'Explicações claras, comparativos úteis e dicas aplicáveis conectadas a ferramentas gratuitas que você pode usar direto no navegador.',
    latest: 'Artigos mais recentes',
    readArticle: 'Ler artigo',
    back: 'Voltar ao Blog',
    relatedTools: 'Ferramentas relacionadas a este guia',
    relatedPosts: 'Continue lendo',
    useTool: 'Abrir ferramenta',
    published: 'Publicado em',
    updated: 'Atualizado em',
    freeBrowserTools: 'Ferramentas grátis no navegador'
  },
  es: {
    eyebrow: 'BLOG CONTROOLS',
    title: 'Guías prácticas para archivos, diseño y trabajo digital.',
    description: 'Explicaciones claras, comparaciones útiles y consejos aplicables conectados con herramientas gratuitas que puedes usar directamente en el navegador.',
    latest: 'Artículos más recientes',
    readArticle: 'Leer artículo',
    back: 'Volver al Blog',
    relatedTools: 'Herramientas relacionadas con esta guía',
    relatedPosts: 'Sigue leyendo',
    useTool: 'Abrir herramienta',
    published: 'Publicado',
    updated: 'Actualizado',
    freeBrowserTools: 'Herramientas gratis en el navegador'
  },
  zh: {
    eyebrow: 'CONTROOLS 博客',
    title: '关于文件、设计与日常数字工作的实用指南。',
    description: '用清晰的解释、实用的对比和可操作的方法，连接到可以直接在浏览器中使用的免费工具。',
    latest: '最新文章',
    readArticle: '阅读文章',
    back: '返回博客',
    relatedTools: '本指南相关工具',
    relatedPosts: '继续阅读',
    useTool: '打开工具',
    published: '发布于',
    updated: '更新于',
    freeBrowserTools: '浏览器中的免费工具'
  },
  hi: {
    eyebrow: 'CONTROOLS ब्लॉग',
    title: 'फ़ाइलों, डिज़ाइन और रोज़मर्रा के डिजिटल काम के लिए व्यावहारिक गाइड।',
    description: 'स्पष्ट समझ, उपयोगी तुलना और ऐसे व्यावहारिक तरीके जो सीधे ब्राउज़र में चलने वाले मुफ़्त टूल्स से जुड़े हैं।',
    latest: 'नए लेख',
    readArticle: 'लेख पढ़ें',
    back: 'ब्लॉग पर वापस जाएँ',
    relatedTools: 'इस गाइड से जुड़े टूल्स',
    relatedPosts: 'आगे पढ़ें',
    useTool: 'टूल खोलें',
    published: 'प्रकाशित',
    updated: 'अपडेट',
    freeBrowserTools: 'ब्राउज़र में मुफ़्त टूल्स'
  }
};

export const blogPosts: BlogPost[] = [
  {
    id: 'reduce-image-size',
    cover: '/blog/image-compression.svg',
    publishedAt: '2026-08-16',
    updatedAt: '2026-08-16',
    relatedTools: ['compress-jpg', 'compress-png', 'compress-webp', 'resize-image'],
    translations: {
      en: {
        slug: 'how-to-reduce-image-size-without-losing-quality',
        title: 'How to reduce image size without noticeably losing quality',
        description: 'Learn what really reduces image file size, how compression differs from resizing, and which format to choose for lighter images with good visual quality.',
        category: 'Images',
        alt: 'Abstract image compression illustration showing a large JPG file becoming a smaller file while preserving the visual preview',
        intro: 'A lighter image loads faster, is easier to send and takes less storage. The challenge is reducing file size without turning a sharp photo into a visibly damaged one. The best result usually comes from combining the right dimensions, format and compression level rather than pushing a single setting to the extreme.',
        sections: [
          {
            heading: 'Start by separating compression from resizing',
            paragraphs: [
              'Compression reduces the amount of data needed to store an image. Resizing changes its pixel dimensions. They solve different problems, but they often work best together.',
              'If a photo is 5000 pixels wide and will only be displayed at 1200 pixels, keeping all those extra pixels adds weight with little practical benefit. Resize it first, then compress the resulting file.'
            ]
          },
          {
            heading: 'Choose the format according to the image',
            paragraphs: [
              'JPG remains practical for photographs and complex images. PNG is useful when transparency or very crisp graphic edges are important. WebP can often produce smaller files while keeping good visual quality, which makes it a strong choice for websites and many digital workflows.',
              'There is no universal winner for every file. A logo with transparency and a photograph have very different needs, so compare the result instead of choosing only by extension.'
            ]
          },
          {
            heading: 'Reduce weight in small, controlled steps',
            paragraphs: [
              'Begin with the dimensions the image actually needs. Then apply moderate compression and inspect details such as faces, text, gradients and fine edges. If the result still looks clean, reduce the file a little more.',
              'This gradual approach is safer than applying maximum compression immediately. Once visible artifacts appear, the file may be smaller but no longer appropriate for the intended use.'
            ],
            bullets: [
              'Keep an original copy before processing.',
              'Resize oversized images before compressing them.',
              'Check the final image at the size people will actually view it.',
              'Use WebP when compatibility with your destination is appropriate.'
            ]
          }
        ],
        conclusion: 'The best compression is not the smallest possible file. It is the smallest file that still looks right for its purpose. CONTROOLS lets you test compression, resizing and format conversion directly in the browser so you can compare results before deciding.'
      },
      pt: {
        slug: 'como-reduzir-tamanho-imagem-sem-perder-qualidade',
        title: 'Como reduzir o tamanho de uma imagem sem perder qualidade visível',
        description: 'Entenda o que realmente reduz o peso de uma imagem, a diferença entre comprimir e redimensionar e como escolher o formato certo sem estragar a qualidade.',
        category: 'Imagens',
        alt: 'Ilustração abstrata de compressão mostrando um arquivo JPG grande se tornando menor enquanto mantém a aparência da imagem',
        intro: 'Uma imagem mais leve carrega mais rápido, é mais fácil de enviar e ocupa menos espaço. O desafio é diminuir o arquivo sem transformar uma foto nítida em uma imagem cheia de artefatos. Na prática, o melhor resultado costuma vir da combinação entre dimensões corretas, formato adequado e compressão moderada.',
        sections: [
          {
            heading: 'Primeiro, separe compressão de redimensionamento',
            paragraphs: [
              'Comprimir reduz a quantidade de dados usada para armazenar a imagem. Redimensionar altera a largura e a altura em pixels. São processos diferentes, mas muitas vezes devem ser usados juntos.',
              'Se uma foto tem 5000 pixels de largura e será exibida com apenas 1200 pixels, manter toda essa resolução aumenta o peso sem trazer benefício perceptível. Nesse caso, redimensione primeiro e comprima depois.'
            ]
          },
          {
            heading: 'Escolha o formato de acordo com o conteúdo',
            paragraphs: [
              'JPG continua sendo prático para fotografias e imagens complexas. PNG é importante quando transparência ou bordas gráficas muito nítidas são necessárias. WebP costuma oferecer arquivos menores com boa qualidade visual e funciona muito bem para sites e diversos usos digitais.',
              'Não existe um formato campeão para todos os casos. Uma logo transparente e uma fotografia exigem coisas diferentes. O ideal é comparar o resultado visual e o tamanho final.'
            ]
          },
          {
            heading: 'Reduza o peso em etapas controladas',
            paragraphs: [
              'Comece usando as dimensões que a imagem realmente precisa ter. Depois aplique uma compressão moderada e observe rostos, textos, degradês e bordas finas. Se tudo continuar limpo, você pode tentar reduzir um pouco mais.',
              'Esse processo gradual é mais seguro do que aplicar compressão máxima de uma vez. Quando os defeitos começam a ficar visíveis, o arquivo pode até estar menor, mas já perdeu qualidade útil.'
            ],
            bullets: [
              'Guarde uma cópia do arquivo original.',
              'Redimensione imagens muito grandes antes de comprimir.',
              'Confira o resultado no tamanho em que ele realmente será visto.',
              'Considere WebP quando o destino aceitar esse formato.'
            ]
          }
        ],
        conclusion: 'A melhor compressão não é a que gera o menor arquivo possível, e sim a que mantém a aparência certa com o menor peso necessário. Na CONTROOLS você pode testar compressão, redimensionamento e conversão de formatos diretamente no navegador e comparar os resultados.'
      },
      es: {
        slug: 'como-reducir-tamano-imagen-sin-perder-calidad',
        title: 'Cómo reducir el tamaño de una imagen sin perder calidad visible',
        description: 'Aprende qué reduce realmente el peso de una imagen, la diferencia entre comprimir y redimensionar y cómo elegir el formato adecuado sin dañar la calidad.',
        category: 'Imágenes',
        alt: 'Ilustración abstracta de compresión donde un archivo JPG grande se convierte en uno más pequeño manteniendo la apariencia visual',
        intro: 'Una imagen más ligera carga más rápido, se envía con mayor facilidad y ocupa menos espacio. El reto es reducir el archivo sin convertir una foto nítida en una imagen llena de defectos. Normalmente, el mejor resultado surge de combinar dimensiones correctas, formato adecuado y una compresión moderada.',
        sections: [
          {
            heading: 'Diferencia compresión de redimensionamiento',
            paragraphs: [
              'Comprimir reduce la cantidad de datos necesarios para guardar una imagen. Redimensionar cambia su ancho y alto en píxeles. Son procesos distintos, aunque suelen funcionar mejor cuando se combinan.',
              'Si una foto tiene 5000 píxeles de ancho y solo se mostrará a 1200, conservar todos esos píxeles añade peso sin aportar una ventaja visible. Redimensiona primero y comprime después.'
            ]
          },
          {
            heading: 'Elige el formato según el contenido',
            paragraphs: [
              'JPG sigue siendo útil para fotografías. PNG es importante cuando necesitas transparencia o bordes gráficos muy definidos. WebP suele ofrecer archivos más pequeños con buena calidad visual y es una opción fuerte para sitios web y muchos usos digitales.',
              'No existe un formato perfecto para todos los archivos. Un logotipo transparente y una fotografía tienen necesidades diferentes, así que conviene comparar el resultado visual y el peso final.'
            ]
          },
          {
            heading: 'Reduce el peso de forma gradual',
            paragraphs: [
              'Empieza con las dimensiones que realmente necesita la imagen. Aplica después una compresión moderada y revisa rostros, textos, degradados y bordes finos. Si todo se mantiene limpio, prueba una reducción adicional.',
              'Trabajar por etapas es más seguro que aplicar la compresión máxima desde el inicio. Cuando aparecen defectos visibles, el archivo puede ser menor pero ya no es adecuado para el uso previsto.'
            ],
            bullets: [
              'Conserva una copia del archivo original.',
              'Redimensiona imágenes demasiado grandes antes de comprimir.',
              'Revisa la imagen al tamaño real de visualización.',
              'Considera WebP cuando el destino sea compatible.'
            ]
          }
        ],
        conclusion: 'La mejor compresión no crea el archivo más pequeño posible, sino el archivo más ligero que todavía se ve bien para su objetivo. En CONTROOLS puedes probar compresión, redimensionamiento y conversión de formatos directamente en el navegador.'
      },
      zh: {
        slug: '如何减小图片大小又保持清晰度',
        title: '如何减小图片文件大小，又不明显损失画质',
        description: '了解压缩与调整尺寸的区别，以及如何选择 JPG、PNG 或 WebP，在降低文件大小的同时保持良好视觉质量。',
        category: '图片',
        alt: '抽象图片压缩示意图，一个较大的 JPG 文件变成更小的文件，同时保留图片预览效果',
        intro: '更小的图片加载更快、发送更方便，也能节省存储空间。真正的难点不是把文件压到最小，而是在减小体积后仍保持足够清晰。通常，正确的像素尺寸、合适的格式和适度压缩一起使用，效果最好。',
        sections: [
          {
            heading: '先区分压缩和调整尺寸',
            paragraphs: [
              '压缩会减少保存图片所需的数据量；调整尺寸则改变图片的像素宽度和高度。两者解决的问题不同，但很多时候应该配合使用。',
              '如果一张照片宽度为 5000 像素，而页面上只需要显示 1200 像素，那么保留多余像素往往只会增加文件大小。先调整到实际需要的尺寸，再进行压缩会更合理。'
            ]
          },
          {
            heading: '根据图片内容选择格式',
            paragraphs: [
              'JPG 很适合照片和复杂图像；PNG 更适合需要透明背景或清晰图形边缘的内容；WebP 通常可以在保持良好视觉质量的同时获得更小的文件，因此很适合网站和数字内容。',
              '不存在适合所有图片的唯一格式。透明 Logo 和摄影照片的需求完全不同，最好比较最终视觉效果和文件大小后再决定。'
            ]
          },
          {
            heading: '分步骤降低文件大小',
            paragraphs: [
              '先把图片调整到真正需要的尺寸，再使用中等程度的压缩。重点检查人物面部、文字、渐变和细小边缘。如果画面仍然干净，可以再适当降低文件大小。',
              '这种逐步调整的方式比一开始就使用最高压缩更安全。一旦出现明显块状、模糊或边缘损坏，即使文件更小，也可能不再适合实际用途。'
            ],
            bullets: [
              '处理前保留原始文件。',
              '先缩小尺寸过大的图片，再进行压缩。',
              '按照用户实际看到的显示尺寸检查结果。',
              '目标平台支持时，可以优先比较 WebP。'
            ]
          }
        ],
        conclusion: '好的压缩不是追求最小文件，而是在用途允许的画质范围内尽可能减小体积。你可以在 CONTROOLS 中直接使用浏览器完成图片压缩、尺寸调整和格式转换，并对比结果。'
      },
      hi: {
        slug: 'image-size-kaise-kam-karen-quality-bachaye',
        title: 'इमेज का साइज़ कैसे कम करें और क्वालिटी को साफ़ रखें',
        description: 'जानें कि compression और resize में क्या अंतर है, सही format कैसे चुनें और JPG, PNG या WebP को हल्का करते समय visual quality कैसे बचाएँ।',
        category: 'इमेज',
        alt: 'इमेज compression का अमूर्त दृश्य जिसमें बड़ा JPG फ़ाइल छोटा हो रहा है और image preview साफ़ बना हुआ है',
        intro: 'हल्की इमेज जल्दी लोड होती है, आसानी से भेजी जाती है और कम storage लेती है। असली लक्ष्य सिर्फ़ फ़ाइल को छोटा करना नहीं, बल्कि ऐसा करते समय उसकी उपयोगी visual quality बचाए रखना है। सही dimensions, सही format और संतुलित compression का मेल आमतौर पर सबसे अच्छा परिणाम देता है।',
        sections: [
          {
            heading: 'Compression और resize को अलग समझें',
            paragraphs: [
              'Compression इमेज को store करने के लिए जरूरी data कम करता है, जबकि resize उसकी pixel width और height बदलता है। दोनों अलग काम करते हैं, लेकिन कई मामलों में इन्हें साथ इस्तेमाल करना बेहतर होता है।',
              'अगर फोटो 5000 pixels चौड़ी है लेकिन वेबसाइट पर केवल 1200 pixels में दिखेगी, तो अतिरिक्त pixels फ़ाइल का वजन बढ़ाते हैं। पहले resize करें और उसके बाद compression लगाएँ।'
            ]
          },
          {
            heading: 'इमेज के अनुसार format चुनें',
            paragraphs: [
              'JPG फोटो और complex images के लिए उपयोगी है। PNG तब बेहतर है जब transparency या बहुत साफ़ graphic edges चाहिए। WebP अक्सर अच्छी visual quality के साथ छोटी फ़ाइल दे सकता है, इसलिए वेबसाइट और digital use में यह मजबूत विकल्प है।',
              'हर इमेज के लिए एक ही format सबसे अच्छा नहीं होता। Transparent logo और photograph की जरूरतें अलग होती हैं, इसलिए extension से ज्यादा final result को देखें।'
            ]
          },
          {
            heading: 'फ़ाइल का वजन धीरे-धीरे कम करें',
            paragraphs: [
              'पहले इमेज को उसके वास्तविक उपयोग के dimensions तक लाएँ। फिर moderate compression लगाकर faces, text, gradients और fine edges देखें। अगर सब साफ़ है, तो थोड़ा और कम करने की कोशिश करें।',
              'एक ही बार में maximum compression लगाने के बजाय छोटे steps में काम करना सुरक्षित है। Visible artifacts आने लगें तो फ़ाइल भले छोटी हो जाए, लेकिन उसकी उपयोगी quality कम हो चुकी होती है।'
            ],
            bullets: [
              'Original file की copy रखें।',
              'बहुत बड़ी images को पहले resize करें।',
              'Final image को उसी size पर देखें जिस पर लोग उसे देखेंगे।',
              'Destination support करे तो WebP का result compare करें।'
            ]
          }
        ],
        conclusion: 'सबसे अच्छी compression वह नहीं है जो सबसे छोटी फ़ाइल बनाए, बल्कि वह है जो जरूरत के अनुसार साफ़ दिखते हुए कम वजन दे। CONTROOLS में आप browser के अंदर compression, resize और format conversion को compare कर सकते हैं।'
      }
    }
  },
  {
    id: 'dpi-for-printing',
    cover: '/blog/dpi-printing.svg',
    publishedAt: '2026-08-16',
    updatedAt: '2026-08-16',
    relatedTools: ['change-image-dpi', 'dpi-calculator', 'print-size-calculator', 'image-dimensions'],
    translations: {
      en: {
        slug: '72-150-300-dpi-which-resolution-for-printing',
        title: '72, 150 or 300 DPI: which resolution should you use for printing?',
        description: 'Understand what DPI means, when 300 DPI matters and why the physical print size is just as important as the pixel dimensions of the image.',
        category: 'Printing',
        alt: 'Printing resolution illustration with pixel grids at 72 DPI, 150 DPI and 300 DPI beside a sheet of paper',
        intro: 'DPI is often treated as a single quality number, but print resolution only makes sense together with the physical size of the final piece and the pixel dimensions available in the image. A file can be 300 DPI and still be too small for a large print, while a lower effective resolution can be acceptable for material viewed from farther away.',
        sections: [
          {
            heading: 'What DPI actually tells you',
            paragraphs: [
              'DPI describes how densely image information is placed across a physical inch of print. The more pixels available for each inch, the finer the printed detail can be.',
              'The useful question is therefore not only “what DPI is this file?” but also “at what physical size will these pixels be printed?”. The same image can produce different effective resolutions depending on the chosen width and height.'
            ]
          },
          {
            heading: 'When 300 DPI is a good target',
            paragraphs: [
              'For pieces that will be seen closely, such as cards, flyers, photos and many small-format prints, 300 DPI is a common practical target because it preserves fine detail well when the source image has enough pixels.',
              'Larger pieces viewed from a greater distance may work well with a lower effective resolution. The correct value depends on the printing process, viewing distance and expected detail.'
            ]
          },
          {
            heading: 'Check pixels before enlarging',
            paragraphs: [
              'Changing only the DPI metadata does not create new real detail. If the source file does not contain enough pixels, setting the number to 300 cannot magically restore information that is not there.',
              'Before sending artwork to print, calculate the relationship between pixel dimensions, physical size and target DPI. This avoids enlarging a small image beyond what its detail can support.'
            ],
            bullets: [
              'Check the image dimensions in pixels.',
              'Define the final physical print size.',
              'Calculate the effective DPI at that size.',
              'Evaluate viewing distance and printing method before deciding.'
            ]
          }
        ],
        conclusion: 'DPI is most useful as part of a calculation, not as an isolated label. Use the pixel dimensions and final print size together, then choose a resolution that fits the real viewing conditions.'
      },
      pt: {
        slug: '72-150-300-dpi-qual-resolucao-usar-impressao',
        title: '72, 150 ou 300 DPI: qual resolução usar para impressão?',
        description: 'Entenda o que significa DPI, quando 300 DPI faz diferença e por que o tamanho físico da impressão importa tanto quanto a quantidade de pixels da imagem.',
        category: 'Impressão',
        alt: 'Ilustração de resolução para impressão com grades de pixels em 72 DPI, 150 DPI e 300 DPI ao lado de uma folha',
        intro: 'DPI costuma ser tratado como se fosse um número isolado de qualidade, mas a resolução de impressão só faz sentido quando analisamos também o tamanho físico final e a quantidade de pixels disponíveis. Um arquivo marcado como 300 DPI ainda pode ser pequeno demais para uma impressão grande, enquanto uma resolução efetiva menor pode funcionar em materiais vistos de longe.',
        sections: [
          {
            heading: 'O que o DPI realmente indica',
            paragraphs: [
              'DPI indica a densidade de informação distribuída em uma polegada física da impressão. Quanto mais pixels disponíveis por polegada, maior a capacidade de reproduzir detalhes finos.',
              'Por isso, a pergunta correta não é apenas “qual o DPI do arquivo?”, mas também “em qual tamanho físico esses pixels serão impressos?”. A mesma imagem pode resultar em resoluções efetivas diferentes dependendo da largura e altura escolhidas.'
            ]
          },
          {
            heading: 'Quando 300 DPI é uma boa referência',
            paragraphs: [
              'Para materiais observados de perto, como cartões, panfletos, fotografias e muitos impressos de pequeno formato, 300 DPI é uma referência prática bastante comum porque preserva bem os detalhes quando a imagem original tem pixels suficientes.',
              'Em peças maiores, vistas a uma distância maior, uma resolução efetiva menor pode ser perfeitamente adequada. O valor ideal depende do processo de impressão, da distância de visualização e do nível de detalhe esperado.'
            ]
          },
          {
            heading: 'Confira os pixels antes de ampliar',
            paragraphs: [
              'Alterar apenas a informação de DPI do arquivo não cria detalhes novos. Se a imagem original não tem pixels suficientes, simplesmente escrever 300 no campo de resolução não recupera informação que não existe.',
              'Antes de enviar uma arte para produção, calcule a relação entre pixels, tamanho físico e DPI desejado. Isso evita ampliar uma imagem pequena além do limite em que ela consegue permanecer nítida.'
            ],
            bullets: [
              'Confira as dimensões da imagem em pixels.',
              'Defina o tamanho físico final da impressão.',
              'Calcule o DPI efetivo nesse tamanho.',
              'Considere a distância de visualização e o processo de impressão.'
            ]
          }
        ],
        conclusion: 'DPI é mais útil como parte de um cálculo do que como um selo isolado de qualidade. Cruze as dimensões em pixels com o tamanho final da peça e escolha uma resolução compatível com a situação real de uso.'
      },
      es: {
        slug: '72-150-300-dpi-que-resolucion-usar-para-imprimir',
        title: '72, 150 o 300 DPI: ¿qué resolución usar para imprimir?',
        description: 'Entiende qué significa DPI, cuándo 300 DPI importa y por qué el tamaño físico de impresión es tan importante como las dimensiones en píxeles.',
        category: 'Impresión',
        alt: 'Ilustración de resolución de impresión con cuadrículas de 72 DPI, 150 DPI y 300 DPI junto a una hoja',
        intro: 'DPI suele presentarse como un único número de calidad, pero la resolución de impresión solo tiene sentido junto con el tamaño físico final y la cantidad de píxeles disponibles. Un archivo marcado como 300 DPI puede seguir siendo insuficiente para una impresión grande, mientras que una resolución efectiva menor puede funcionar en piezas vistas desde lejos.',
        sections: [
          {
            heading: 'Qué indica realmente el DPI',
            paragraphs: [
              'DPI describe la densidad de información distribuida en una pulgada física de impresión. Cuantos más píxeles haya disponibles por pulgada, mayor será la capacidad de reproducir detalles finos.',
              'Por eso no basta con preguntar “¿cuántos DPI tiene el archivo?”. También debes saber a qué tamaño físico se imprimirán esos píxeles. La misma imagen puede tener resoluciones efectivas diferentes según el tamaño final.'
            ]
          },
          {
            heading: 'Cuándo 300 DPI es una buena referencia',
            paragraphs: [
              'Para materiales que se observan de cerca, como tarjetas, folletos y fotografías, 300 DPI es una referencia práctica habitual cuando la imagen original tiene suficientes píxeles.',
              'Las piezas grandes vistas desde mayor distancia pueden funcionar bien con una resolución efectiva inferior. El valor adecuado depende del proceso de impresión, la distancia de observación y el detalle esperado.'
            ]
          },
          {
            heading: 'Comprueba los píxeles antes de ampliar',
            paragraphs: [
              'Cambiar solamente el dato de DPI no crea detalle real. Si el archivo original no contiene suficientes píxeles, establecer 300 DPI no recuperará información inexistente.',
              'Antes de producir una pieza, calcula la relación entre dimensiones en píxeles, tamaño físico y DPI objetivo. Así evitarás ampliar una imagen más allá de lo que puede soportar con nitidez.'
            ],
            bullets: [
              'Comprueba las dimensiones en píxeles.',
              'Define el tamaño físico final.',
              'Calcula el DPI efectivo.',
              'Considera la distancia de observación y el método de impresión.'
            ]
          }
        ],
        conclusion: 'DPI resulta más útil como parte de un cálculo que como una etiqueta aislada. Combina píxeles y tamaño final para elegir una resolución adecuada al uso real.'
      },
      zh: {
        slug: '72-150-300-dpi-打印分辨率怎么选',
        title: '72、150 还是 300 DPI：打印分辨率应该怎么选？',
        description: '理解 DPI 的真正含义、300 DPI 什么时候重要，以及为什么最终打印尺寸必须和图片像素一起计算。',
        category: '打印',
        alt: '打印分辨率示意图，展示 72 DPI、150 DPI 和 300 DPI 的像素网格以及纸张',
        intro: '很多人把 DPI 当成一个独立的质量数字，但打印分辨率必须和最终物理尺寸、图片本身的像素数量一起看。一个标记为 300 DPI 的文件仍可能不适合大型打印，而远距离观看的大幅画面有时可以使用更低的有效分辨率。',
        sections: [
          {
            heading: 'DPI 真正表示什么',
            paragraphs: [
              'DPI 表示在一英寸物理打印范围内信息的密度。每英寸可用的像素越多，通常越有能力表现细小细节。',
              '所以不能只问“这个文件是多少 DPI”，还要问“这些像素最终会以多大的尺寸打印”。同一张图片在不同物理尺寸下会得到不同的有效分辨率。'
            ]
          },
          {
            heading: '什么时候以 300 DPI 为目标',
            paragraphs: [
              '对于名片、传单、照片等近距离观看的小尺寸印刷品，如果原图像素足够，300 DPI 是一个常见而实用的参考值，可以较好地保留细节。',
              '大型画面通常从更远距离观看，因此较低的有效分辨率也可能满足需求。实际标准需要结合打印工艺、观看距离和细节要求。'
            ]
          },
          {
            heading: '放大之前先检查像素',
            paragraphs: [
              '只修改文件中的 DPI 数值并不会创造新的真实细节。如果源图片像素不足，把数字改成 300 也不能补回不存在的信息。',
              '打印前应计算像素尺寸、最终物理尺寸和目标 DPI 之间的关系，这样可以避免把小图片放大到超出清晰度能力的范围。'
            ],
            bullets: [
              '确认图片的像素宽度和高度。',
              '确定最终打印的物理尺寸。',
              '计算该尺寸下的有效 DPI。',
              '结合观看距离和打印方式做最终决定。'
            ]
          }
        ],
        conclusion: 'DPI 更适合作为计算的一部分，而不是单独的质量标签。把像素尺寸和成品尺寸结合起来，才能选择真正适合使用场景的分辨率。'
      },
      hi: {
        slug: '72-150-300-dpi-print-resolution-kaise-chunen',
        title: '72, 150 या 300 DPI: printing के लिए कौन-सी resolution चुनें?',
        description: 'समझें कि DPI का मतलब क्या है, 300 DPI कब जरूरी होता है और final print size को image pixels के साथ क्यों देखना चाहिए।',
        category: 'प्रिंटिंग',
        alt: 'Printing resolution का दृश्य जिसमें paper के साथ 72 DPI, 150 DPI और 300 DPI pixel grids दिखते हैं',
        intro: 'DPI को अक्सर एक अकेले quality number की तरह देखा जाता है, लेकिन print resolution का सही अर्थ final physical size और image में उपलब्ध pixels के साथ ही बनता है। 300 DPI लिखा हुआ file भी बड़े print के लिए छोटा पड़ सकता है, जबकि दूर से देखे जाने वाले बड़े material में कम effective resolution भी ठीक काम कर सकती है।',
        sections: [
          {
            heading: 'DPI वास्तव में क्या बताता है',
            paragraphs: [
              'DPI बताता है कि print की एक physical inch में image information कितनी density से रखी जाएगी। प्रति inch ज्यादा pixels होने पर fine detail दिखाने की क्षमता बढ़ती है।',
              'इसलिए सिर्फ़ “file कितने DPI का है?” पूछना काफी नहीं है। यह भी देखना जरूरी है कि उपलब्ध pixels को कितने physical size पर print किया जाएगा।'
            ]
          },
          {
            heading: '300 DPI कब अच्छा target है',
            paragraphs: [
              'Cards, flyers और photos जैसे पास से देखे जाने वाले छोटे prints के लिए 300 DPI एक practical target है, बशर्ते source image में पर्याप्त pixels हों।',
              'दूर से देखे जाने वाले बड़े prints में कम effective resolution भी पर्याप्त हो सकती है। सही value printing process, viewing distance और अपेक्षित detail पर निर्भर करती है।'
            ]
          },
          {
            heading: 'Enlarge करने से पहले pixels जाँचें',
            paragraphs: [
              'सिर्फ़ DPI metadata बदलने से नई real detail पैदा नहीं होती। अगर source file में पर्याप्त pixels नहीं हैं, तो number को 300 कर देने से missing information वापस नहीं आएगी।',
              'Print भेजने से पहले pixel dimensions, final physical size और target DPI का संबंध calculate करें। इससे छोटी image को जरूरत से ज्यादा enlarge करने से बचेंगे।'
            ],
            bullets: [
              'Image dimensions को pixels में देखें।',
              'Final physical print size तय करें।',
              'उस size पर effective DPI calculate करें।',
              'Viewing distance और printing method को ध्यान में रखें।'
            ]
          }
        ],
        conclusion: 'DPI एक अकेला quality label नहीं, बल्कि calculation का हिस्सा है। Pixels और final print size को साथ देखकर ही सही resolution चुनें।'
      }
    }
  },
  {
    id: 'jpg-png-webp',
    cover: '/blog/jpg-png-webp.svg',
    publishedAt: '2026-08-16',
    updatedAt: '2026-08-16',
    relatedTools: ['jpg-to-png', 'jpg-to-webp', 'png-to-webp', 'webp-to-jpg'],
    translations: {
      en: {
        slug: 'jpg-png-or-webp-which-image-format-to-use',
        title: 'JPG, PNG or WebP: which image format should you use?',
        description: 'Compare JPG, PNG and WebP in practical terms: file size, transparency, visual quality and the situations where each format makes the most sense.',
        category: 'Images',
        alt: 'Three visual image cards comparing the universal file format labels JPG, PNG and WebP',
        intro: 'JPG, PNG and WebP can all store images, but they are optimized for different needs. Choosing the right format can reduce file size, preserve transparency and avoid unnecessary quality loss before you even touch a compression slider.',
        sections: [
          {
            heading: 'JPG: practical for photographs',
            paragraphs: [
              'JPG uses lossy compression, which makes it efficient for photographs and images with many colors and gradual tonal changes. It can produce relatively small files, but repeated editing and aggressive compression can introduce visible artifacts.',
              'It does not support the kind of full transparency commonly expected from PNG, so it is less suitable for logos and cutout graphics that need a transparent background.'
            ]
          },
          {
            heading: 'PNG: strong for transparency and sharp graphics',
            paragraphs: [
              'PNG is a strong choice for interface graphics, screenshots, logos and images where transparency matters. Its lossless approach preserves exact image data better through saves, but files can become larger than equivalent photographic JPG or WebP files.',
              'That makes PNG valuable when its specific strengths are needed, not necessarily as the default choice for every image.'
            ]
          },
          {
            heading: 'WebP: a modern balance for the web',
            paragraphs: [
              'WebP supports both lossy and lossless compression and can also preserve transparency. In many web scenarios, it achieves a useful balance between file size and visual quality.',
              'If your destination supports WebP, it is worth comparing it with the original JPG or PNG. Keep the source file as well, especially when future editing or compatibility with another workflow may be needed.'
            ],
            bullets: [
              'Use JPG mainly for photographs when broad compatibility matters.',
              'Use PNG when transparency or lossless graphic detail is important.',
              'Compare WebP when you want lighter web assets.',
              'Keep an original master before converting between formats.'
            ]
          }
        ],
        conclusion: 'The best format depends on the image and its destination. Instead of converting everything to the same extension, choose according to transparency, detail, compatibility and file-size needs, then compare the final result.'
      },
      pt: {
        slug: 'jpg-png-ou-webp-qual-formato-de-imagem-usar',
        title: 'JPG, PNG ou WebP: qual formato de imagem usar?',
        description: 'Compare JPG, PNG e WebP de forma prática: peso do arquivo, transparência, qualidade visual e quando cada formato faz mais sentido.',
        category: 'Imagens',
        alt: 'Três cartões visuais comparando os formatos universais de arquivo JPG, PNG e WebP',
        intro: 'JPG, PNG e WebP armazenam imagens, mas foram pensados para necessidades diferentes. Escolher o formato certo pode reduzir bastante o peso do arquivo, manter transparência e evitar perda de qualidade desnecessária antes mesmo de mexer em qualquer nível de compressão.',
        sections: [
          {
            heading: 'JPG: prático para fotografias',
            paragraphs: [
              'JPG utiliza compressão com perdas, o que funciona muito bem em fotografias e imagens com muitas cores e variações suaves de tom. Ele consegue gerar arquivos relativamente leves, mas compressões muito fortes ou sucessivas edições podem criar artefatos visíveis.',
              'O formato não oferece a transparência completa normalmente associada ao PNG. Por isso, não costuma ser a melhor escolha para logos recortadas ou elementos gráficos que precisam de fundo transparente.'
            ]
          },
          {
            heading: 'PNG: transparência e gráficos nítidos',
            paragraphs: [
              'PNG é uma excelente opção para interfaces, capturas de tela, logos e imagens em que a transparência é importante. Como trabalha de forma sem perdas, preserva melhor os dados visuais exatos, mas pode gerar arquivos maiores em fotografias.',
              'Isso faz do PNG uma ótima escolha quando suas características são realmente necessárias, e não necessariamente o formato padrão para qualquer tipo de imagem.'
            ]
          },
          {
            heading: 'WebP: equilíbrio moderno para a web',
            paragraphs: [
              'WebP suporta compressão com e sem perdas e também pode manter transparência. Em muitos cenários de web, consegue oferecer uma relação muito boa entre peso e qualidade visual.',
              'Se o destino aceita WebP, vale comparar o arquivo com o JPG ou PNG original. Ainda assim, mantenha o arquivo-fonte guardado quando houver chance de precisar editar novamente ou usar um fluxo que exija outro formato.'
            ],
            bullets: [
              'Use JPG principalmente para fotografias e ampla compatibilidade.',
              'Use PNG quando transparência ou detalhe gráfico sem perdas forem importantes.',
              'Compare WebP quando o objetivo for deixar imagens da web mais leves.',
              'Guarde um arquivo original antes de fazer conversões.'
            ]
          }
        ],
        conclusion: 'O melhor formato depende da imagem e de onde ela será usada. Em vez de converter tudo para a mesma extensão, escolha com base em transparência, nível de detalhe, compatibilidade e peso do arquivo e compare o resultado final.'
      },
      es: {
        slug: 'jpg-png-o-webp-que-formato-de-imagen-usar',
        title: 'JPG, PNG o WebP: ¿qué formato de imagen usar?',
        description: 'Compara JPG, PNG y WebP de forma práctica: tamaño de archivo, transparencia, calidad visual y cuándo conviene utilizar cada formato.',
        category: 'Imágenes',
        alt: 'Tres tarjetas visuales que comparan los formatos universales JPG, PNG y WebP',
        intro: 'JPG, PNG y WebP sirven para guardar imágenes, pero están optimizados para necesidades diferentes. Elegir bien el formato puede reducir el peso, conservar transparencia y evitar pérdidas de calidad innecesarias antes de modificar cualquier ajuste de compresión.',
        sections: [
          {
            heading: 'JPG: práctico para fotografías',
            paragraphs: [
              'JPG utiliza compresión con pérdida, algo eficiente para fotografías e imágenes con muchos colores y transiciones suaves. Puede generar archivos relativamente pequeños, aunque una compresión agresiva o muchas reediciones pueden producir defectos visibles.',
              'No ofrece la transparencia completa que solemos asociar con PNG, por lo que no es la mejor opción para logotipos recortados o gráficos que necesitan fondo transparente.'
            ]
          },
          {
            heading: 'PNG: transparencia y gráficos definidos',
            paragraphs: [
              'PNG es muy útil para interfaces, capturas de pantalla, logotipos e imágenes donde la transparencia es importante. Su compresión sin pérdida conserva mejor los datos, pero puede crear archivos mayores que JPG o WebP en fotografías.',
              'Por eso conviene usar PNG cuando realmente necesitas sus ventajas y no como formato automático para cualquier archivo.'
            ]
          },
          {
            heading: 'WebP: equilibrio moderno para la web',
            paragraphs: [
              'WebP admite compresión con y sin pérdida y también puede mantener transparencia. En muchos usos web ofrece una relación muy competitiva entre tamaño y calidad visual.',
              'Si tu destino acepta WebP, compáralo con el JPG o PNG original. Conserva también el archivo fuente cuando puedas necesitar nuevas ediciones o compatibilidad con otros procesos.'
            ],
            bullets: [
              'Usa JPG principalmente para fotografías y compatibilidad amplia.',
              'Usa PNG cuando la transparencia o el detalle sin pérdida sean importantes.',
              'Compara WebP cuando quieras recursos web más ligeros.',
              'Conserva un original antes de convertir formatos.'
            ]
          }
        ],
        conclusion: 'El mejor formato depende de la imagen y su destino. Elige según transparencia, detalle, compatibilidad y peso en lugar de convertir todos los archivos a la misma extensión.'
      },
      zh: {
        slug: 'jpg-png-webp-图片格式怎么选',
        title: 'JPG、PNG 还是 WebP：图片格式应该怎么选？',
        description: '从文件大小、透明背景、视觉质量和实际用途比较 JPG、PNG 与 WebP，了解不同场景下应该选择哪一种格式。',
        category: '图片',
        alt: '三个视觉卡片对比通用图片格式 JPG、PNG 和 WebP',
        intro: 'JPG、PNG 和 WebP 都可以保存图片，但它们针对的需求并不相同。选对格式，往往在调整压缩参数之前就能减少文件大小、保留透明背景，并避免不必要的画质损失。',
        sections: [
          {
            heading: 'JPG：适合摄影照片',
            paragraphs: [
              'JPG 使用有损压缩，对颜色丰富、明暗过渡平滑的照片非常实用，可以获得相对较小的文件。但压缩过强或多次重新保存可能产生明显的压缩痕迹。',
              'JPG 不提供 PNG 常见的完整透明背景能力，因此对于需要透明底的 Logo 或抠图素材通常不是最佳选择。'
            ]
          },
          {
            heading: 'PNG：透明背景和清晰图形',
            paragraphs: [
              'PNG 很适合界面图形、截图、Logo，以及需要透明背景的图片。无损方式有利于保留精确图像数据，但摄影图片的 PNG 文件往往会比 JPG 或 WebP 更大。',
              '因此，PNG 最适合在真正需要透明或无损图形细节时使用，而不是所有图片的默认格式。'
            ]
          },
          {
            heading: 'WebP：面向网页的现代平衡',
            paragraphs: [
              'WebP 同时支持有损、无损压缩和透明背景。在很多网页场景中，它能在文件大小与视觉质量之间取得很好的平衡。',
              '如果目标平台支持 WebP，建议将它和原始 JPG 或 PNG 进行比较。同时保留源文件，方便以后编辑或用于需要其他格式的工作流程。'
            ],
            bullets: [
              '摄影照片和广泛兼容性可以优先考虑 JPG。',
              '需要透明背景或无损图形细节时考虑 PNG。',
              '希望网页图片更轻时比较 WebP。',
              '格式转换前保留原始主文件。'
            ]
          }
        ],
        conclusion: '最好的格式取决于图片本身和最终用途。不要把所有图片统一转换成一种格式，而应根据透明度、细节、兼容性和文件大小选择，并比较最终结果。'
      },
      hi: {
        slug: 'jpg-png-webp-kaunsa-image-format-use-karen',
        title: 'JPG, PNG या WebP: कौन-सा image format इस्तेमाल करें?',
        description: 'JPG, PNG और WebP को file size, transparency, visual quality और practical use के आधार पर compare करें।',
        category: 'इमेज',
        alt: 'तीन visual cards जिन पर universal image format labels JPG, PNG और WebP दिखाई देते हैं',
        intro: 'JPG, PNG और WebP तीनों images store करते हैं, लेकिन उनकी strengths अलग हैं। सही format चुनने से compression setting बदलने से पहले ही file size कम हो सकता है, transparency बच सकती है और अनावश्यक quality loss से बचा जा सकता है।',
        sections: [
          {
            heading: 'JPG: photographs के लिए practical',
            paragraphs: [
              'JPG lossy compression इस्तेमाल करता है, इसलिए photos और smooth color changes वाली complex images में यह efficient रहता है। File छोटी हो सकती है, लेकिन बहुत aggressive compression या बार-बार save करने से visible artifacts आ सकते हैं।',
              'यह PNG जैसी full transparency के लिए सही नहीं है, इसलिए transparent background वाले logos या cutout graphics में दूसरी format बेहतर हो सकती है।'
            ]
          },
          {
            heading: 'PNG: transparency और sharp graphics',
            paragraphs: [
              'PNG interface graphics, screenshots, logos और transparent images के लिए मजबूत विकल्प है। Lossless approach exact image data को अच्छी तरह बचाती है, लेकिन photographs में file size JPG या WebP से बड़ा हो सकता है।',
              'इसलिए PNG तब चुनें जब उसकी transparency या lossless detail वास्तव में जरूरी हो।'
            ]
          },
          {
            heading: 'WebP: web के लिए modern balance',
            paragraphs: [
              'WebP lossy और lossless दोनों compression के साथ transparency भी support करता है। कई web scenarios में यह file size और visual quality का अच्छा balance देता है।',
              'Destination WebP support करता हो तो original JPG या PNG के साथ result compare करें। Future editing या दूसरे workflow के लिए source file भी संभाल कर रखें।'
            ],
            bullets: [
              'Photos और broad compatibility के लिए JPG पर विचार करें।',
              'Transparency या lossless graphic detail के लिए PNG चुनें।',
              'हल्के web assets के लिए WebP compare करें।',
              'Conversion से पहले original master file रखें।'
            ]
          }
        ],
        conclusion: 'सही format image और उसके destination पर निर्भर करता है। Transparency, detail, compatibility और file size देखकर चुनें और final result compare करें।'
      }
    }
  }
];

export function getBlogPost(locale: Locale, slug: string) {
  return blogPosts.find(post => post.translations[locale].slug === slug);
}

export function blogPath(post: BlogPost, locale: Locale) {
  return `/${locale}/blog/${post.translations[locale].slug}/`;
}

export const blogLocaleMap: Record<Locale, string> = {
  en: 'en-US',
  pt: 'pt-BR',
  es: 'es-ES',
  zh: 'zh-CN',
  hi: 'hi-IN'
};
