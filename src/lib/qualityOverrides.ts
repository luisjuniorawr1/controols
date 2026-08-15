type V=Record<string,string>;

function parse(input:string):V{try{return JSON.parse(input) as V}catch{return{}}}
function text(v:V,key:string){return String(v[key]||'').trim()}
function bullets(value:string){return value.split(/\r?\n|[;]+/).map(x=>x.trim()).filter(Boolean)}
function sourceText(v:V){return Object.values(v).join(' ').toLowerCase()}
function language(v:V):'pt'|'es'|'en'{
  const s=sourceText(v);
  if(/[ãõçáéíóúâêô]/.test(s)||/\b(não|você|quero|para|com|objetivo|saída|restrições|casa|vender|marca|produto|fundo|luz)\b/.test(s))return'pt';
  if(/[ñ¿¡]/.test(s)||/\b(para|con|quiero|objetivo|restricciones|salida|marca|producto)\b/.test(s))return'es';
  return'en';
}
function section(title:string,value:string){return value?`${title}:\n${value}`:''}
function join(parts:string[]){return parts.filter(Boolean).join('\n\n')}

function promptBuilder(v:V){
  const lang=language(v),role=text(v,'role'),goal=text(v,'goal'),context=text(v,'context'),constraints=bullets(text(v,'constraints')),output=text(v,'output')||text(v,'format');
  if(lang==='pt')return join([
    role?`Atue como ${role}.`:'',`Sua missão principal é: ${goal}.`,context?section('Contexto que deve ser considerado',context):'',constraints.length?`Restrições obrigatórias:\n${constraints.map(x=>`- ${x}`).join('\n')}`:'',
    `Instruções de execução:\n1. Analise o objetivo e o contexto antes de responder.\n2. Identifique ambiguidades e, quando necessário, faça apenas suposições razoáveis e deixe-as claras.\n3. Priorize precisão, utilidade prática e coerência com as restrições.\n4. Não invente fatos, dados ou requisitos que não estejam sustentados pelo pedido.\n5. Entregue uma resposta pronta para uso, não apenas comentários sobre como fazê-la.`,
    output?section('Formato e estilo da resposta',output):'Formato e estilo da resposta:\nSeja claro, organizado e direto ao ponto.',`Antes de finalizar, revise se a resposta realmente atende ao objetivo principal e a todas as restrições.`
  ]);
  if(lang==='es')return join([role?`Actúa como ${role}.`:'',`Tu objetivo principal es: ${goal}.`,context?section('Contexto que debes considerar',context):'',constraints.length?`Restricciones obligatorias:\n${constraints.map(x=>`- ${x}`).join('\n')}`:'',`Instrucciones:\n1. Analiza el objetivo y el contexto antes de responder.\n2. Aclara supuestos razonables cuando exista ambigüedad.\n3. Prioriza precisión y utilidad práctica.\n4. No inventes hechos ni requisitos.\n5. Entrega un resultado listo para usar.`,output?section('Formato de salida',output):'Formato de salida:\nClaro, organizado y directo.',`Revisa al final que cumpliste el objetivo y todas las restricciones.`]);
  return join([role?`Act as ${role}.`:'',`Your primary objective is: ${goal}.`,context?section('Context to consider',context):'',constraints.length?`Mandatory constraints:\n${constraints.map(x=>`- ${x}`).join('\n')}`:'',`Execution instructions:\n1. Analyze the objective and context before answering.\n2. Identify ambiguity and state only reasonable assumptions when necessary.\n3. Prioritize accuracy, practical usefulness, and consistency with the constraints.\n4. Do not invent unsupported facts, data, or requirements.\n5. Deliver a ready-to-use result rather than commentary about how to create it.`,output?section('Output format and style',output):'Output format and style:\nBe clear, structured, and direct.',`Before finishing, verify that the response satisfies the main objective and every constraint.`]);
}
function systemPrompt(v:V){
  const lang=language(v),role=text(v,'role'),rules=bullets(text(v,'rules')),context=text(v,'context'),tone=text(v,'tone'),output=text(v,'output');
  if(lang==='pt')return join([`Você é ${role||'um assistente especializado'}.`,context?section('Contexto permanente',context):'',rules.length?`Regras de comportamento:\n${rules.map(x=>`- ${x}`).join('\n')}`:'',`Princípios:\n- Siga as instruções do usuário sem ignorar as regras acima.\n- Quando faltar informação essencial, sinalize claramente a lacuna.\n- Não apresente suposições como fatos.\n- Prefira respostas práticas, verificáveis e consistentes.`,tone?section('Tom',tone):'',output?section('Formato padrão de resposta',output):'']);
  return join([`You are ${role||'a specialized assistant'}.`,context?section('Persistent context',context):'',rules.length?`Behavior rules:\n${rules.map(x=>`- ${x}`).join('\n')}`:'',`Operating principles:\n- Follow the user's instructions without violating the rules above.\n- When essential information is missing, state the gap clearly.\n- Never present assumptions as facts.\n- Prefer practical, verifiable, and consistent answers.`,tone?section('Tone',tone):'',output?section('Default response format',output):'']);
}
function taskPrompt(v:V,kind:'general'|'social'|'seo'|'writing'){
  const lang=language(v),topic=text(v,'topic'),audience=text(v,'audience'),goal=text(v,'goal'),tone=text(v,'tone'),format=text(v,'format');
  const role=kind==='social'?'social media strategist':kind==='seo'?'SEO specialist':kind==='writing'?'professional writer':'expert assistant';
  if(lang==='pt')return join([`Atue como ${kind==='social'?'estrategista de social media':kind==='seo'?'especialista em SEO':kind==='writing'?'redator profissional':'assistente especialista'}.`,section('Tema',topic),audience?section('Público',audience):'',section('Resultado que preciso',goal),tone?section('Tom',tone):'',format?section('Formato',format):'',`Crie uma entrega completa e pronta para uso. Organize a resposta de acordo com o formato solicitado, evite generalidades e priorize recomendações específicas para o objetivo e o público informados.`]);
  return join([`Act as a ${role}.`,section('Topic',topic),audience?section('Audience',audience):'',section('Desired outcome',goal),tone?section('Tone',tone):'',format?section('Format',format):'',`Create a complete, ready-to-use deliverable. Avoid generic filler and tailor the result to the stated goal and audience.`]);
}
function imagePrompt(v:V){
  const lang=language(v),subject=text(v,'subject'),scene=text(v,'scene'),style=text(v,'style'),lighting=text(v,'lighting'),camera=text(v,'camera'),negative=text(v,'negative');
  return lang==='pt'?join([`Crie uma imagem de alta qualidade com ${subject} como assunto principal.`,scene?`Ambiente e composição: ${scene}.`:'',style?`Direção visual: ${style}.`:'',lighting?`Iluminação: ${lighting}.`:'',camera?`Linguagem fotográfica/câmera: ${camera}.`:'',`Mantenha composição coerente, detalhes naturais, materiais bem definidos e hierarquia visual clara.`,negative?`Evite: ${negative}.`:'']):join([`Create a high-quality image featuring ${subject} as the main subject.`,scene?`Environment and composition: ${scene}.`:'',style?`Visual direction: ${style}.`:'',lighting?`Lighting: ${lighting}.`:'',camera?`Camera / photographic language: ${camera}.`:'',`Keep the composition coherent, details natural, materials well defined, and visual hierarchy clear.`,negative?`Avoid: ${negative}.`:'']);
}
function logoPrompt(v:V){
  const lang=language(v),brand=text(v,'brand'),industry=text(v,'industry'),values=text(v,'values'),style=text(v,'style'),colors=text(v,'colors'),negative=text(v,'negative');
  return lang==='pt'?join([`Crie um conceito de logotipo original e memorável para a marca “${brand}”, do segmento ${industry}.`,values?`A identidade deve comunicar: ${values}.`:'',style?`Direção estética: ${style}.`:'',colors?`Direção de cores: ${colors}.`:'',`Priorize uma solução simples de reconhecer, reproduzível em tamanhos pequenos e grandes, com boa leitura em versão monocromática e sem depender de efeitos 3D ou mockups.`,negative?`Evite: ${negative}.`:'',`Apresente o símbolo em vista frontal, fundo neutro, sem aplicações fictícias, e descreva brevemente a lógica visual do conceito.`]):join([`Create an original, memorable logo concept for “${brand}” in the ${industry} industry.`,values?`The identity should communicate: ${values}.`:'',style?`Aesthetic direction: ${style}.`:'',colors?`Color direction: ${colors}.`:'',`Prioritize a recognizable solution that scales cleanly, works in monochrome, and does not rely on 3D effects or mockups.`,negative?`Avoid: ${negative}.`:'',`Present the mark front-facing on a neutral background and briefly explain the visual logic.`]);
}
function productPhotoPrompt(v:V){
  const lang=language(v),product=text(v,'product'),scene=text(v,'scene'),lighting=text(v,'lighting'),camera=text(v,'camera'),style=text(v,'style'),background=text(v,'background');
  return lang==='pt'?join([`Fotografe ${product} como uma peça publicitária premium, preservando fielmente formato, proporções, rótulos e detalhes do produto.`,scene?`Cena: ${scene}.`:'',background?`Fundo: ${background}.`:'',lighting?`Iluminação: ${lighting}.`:'',camera?`Câmera/lente: ${camera}.`:'',style?`Tratamento visual: ${style}.`:'',`Use iluminação comercial limpa, sombras fisicamente plausíveis, nitidez no produto e profundidade de campo natural. Não altere textos, marcas ou informações da embalagem.`]):join([`Photograph ${product} as a premium commercial advertising image while faithfully preserving its shape, proportions, labels, and details.`,scene?`Scene: ${scene}.`:'',background?`Background: ${background}.`:'',lighting?`Lighting: ${lighting}.`:'',camera?`Camera / lens: ${camera}.`:'',style?`Visual treatment: ${style}.`:'',`Use clean commercial lighting, physically plausible shadows, sharp product detail, and natural depth of field. Do not alter text, branding, or package information.`]);
}

export function runQualityOverride(slug:string,category:string,input:string):string|undefined{
  if(category!=='ai')return undefined;const v=parse(input);
  if(slug==='prompt-builder')return promptBuilder(v);if(slug==='system-prompt-builder')return systemPrompt(v);
  if(slug==='chatgpt-prompt-generator')return taskPrompt(v,'general');if(slug==='social-media-prompt-generator')return taskPrompt(v,'social');if(slug==='seo-prompt-generator')return taskPrompt(v,'seo');if(slug==='writing-prompt-generator')return taskPrompt(v,'writing');
  if(slug==='image-prompt-generator')return imagePrompt(v);if(slug==='logo-prompt-generator')return logoPrompt(v);if(slug==='product-photo-prompt-generator')return productPhotoPrompt(v);
  if(slug==='coding-prompt-generator'){
    const lang=language(v);return join([lang==='pt'?'Atue como um engenheiro de software sênior.':'Act as a senior software engineer.',section(lang==='pt'?'Tarefa':'Task',text(v,'task')),text(v,'stack')?section('Stack',text(v,'stack')):'',text(v,'requirements')?section(lang==='pt'?'Requisitos funcionais':'Functional requirements',text(v,'requirements')):'',text(v,'constraints')?section(lang==='pt'?'Restrições':'Constraints',text(v,'constraints')):'',text(v,'output')?section(lang==='pt'?'Saída esperada':'Expected output',text(v,'output')):'',lang==='pt'?`Antes de entregar, verifique erros, casos de borda, segurança básica e se a solução pode ser executada como descrita. Quando fornecer código, entregue blocos completos e indique onde cada arquivo deve ficar.`:`Before delivering, check for errors, edge cases, basic security, and whether the solution can run as described. When providing code, return complete blocks and indicate where each file belongs.`]);
  }
  if(slug==='persona-prompt-generator'){
    const lang=language(v),role=text(v,'role'),expertise=text(v,'expertise'),tone=text(v,'tone'),rules=bullets(text(v,'rules')),boundaries=bullets(text(v,'boundaries'));
    return join([lang==='pt'?`Você é ${role||'um assistente especializado'}${expertise?`, especialista em ${expertise}`:''}.`:`You are ${role||'a specialized assistant'}${expertise?`, with expertise in ${expertise}`:''}.`,tone?section(lang==='pt'?'Tom de comunicação':'Communication tone',tone):'',rules.length?`${lang==='pt'?'Como você deve agir':'How you should behave'}:\n${rules.map(x=>`- ${x}`).join('\n')}`:'',boundaries.length?`${lang==='pt'?'Limites':'Boundaries'}:\n${boundaries.map(x=>`- ${x}`).join('\n')}`:'',lang==='pt'?'Mantenha esse papel de forma consistente ao longo de toda a conversa.':'Maintain this role consistently throughout the conversation.']);
  }
  return undefined;
}