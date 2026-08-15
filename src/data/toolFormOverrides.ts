import type { Locale, Tool } from './catalog';
import type { FieldSpec, ToolFormSpec } from './toolFormSchemas';

const labels:Record<Locale,Record<string,string>>={
 en:{percent:'Percentage',value:'Value',a:'First value',b:'Second value',c:'Third value',timezone:'Time zone',datetime:'Date and time',length:'Length',xml:'XML input',yaml:'YAML input',json:'JSON input',query:'Query string',csv:'CSV data',tsv:'TSV data',column:'Column',term:'Search term',markdown:'Markdown',html:'HTML',numerator:'Numerator',denominator:'Denominator'},
 pt:{percent:'Porcentagem',value:'Valor',a:'Primeiro valor',b:'Segundo valor',c:'Terceiro valor',timezone:'Fuso horário',datetime:'Data e hora',length:'Comprimento',xml:'Entrada XML',yaml:'Entrada YAML',json:'Entrada JSON',query:'Query string',csv:'Dados CSV',tsv:'Dados TSV',column:'Coluna',term:'Termo de busca',markdown:'Markdown',html:'HTML',numerator:'Numerador',denominator:'Denominador'},
 es:{percent:'Porcentaje',value:'Valor',a:'Primer valor',b:'Segundo valor',c:'Tercer valor',timezone:'Zona horaria',datetime:'Fecha y hora',length:'Longitud',xml:'Entrada XML',yaml:'Entrada YAML',json:'Entrada JSON',query:'Query string',csv:'Datos CSV',tsv:'Datos TSV',column:'Columna',term:'Término',markdown:'Markdown',html:'HTML',numerator:'Numerador',denominator:'Denominador'},
 zh:{percent:'百分比',value:'数值',a:'第一个值',b:'第二个值',c:'第三个值',timezone:'时区',datetime:'日期和时间',length:'长度',xml:'XML 输入',yaml:'YAML 输入',json:'JSON 输入',query:'查询字符串',csv:'CSV 数据',tsv:'TSV 数据',column:'列',term:'搜索词',markdown:'Markdown',html:'HTML',numerator:'分子',denominator:'分母'},
 hi:{percent:'प्रतिशत',value:'मान',a:'पहला मान',b:'दूसरा मान',c:'तीसरा मान',timezone:'समय क्षेत्र',datetime:'दिनांक और समय',length:'लंबाई',xml:'XML इनपुट',yaml:'YAML इनपुट',json:'JSON इनपुट',query:'क्वेरी स्ट्रिंग',csv:'CSV डेटा',tsv:'TSV डेटा',column:'कॉलम',term:'खोज शब्द',markdown:'Markdown',html:'HTML',numerator:'अंश',denominator:'हर'}
};
const L=(locale:Locale,k:string)=>labels[locale][k]||labels.en[k]||k;
const f=(locale:Locale,key:string,kind:FieldSpec['kind'],extra:Partial<FieldSpec>={}):FieldSpec=>({key,label:L(locale,key),kind,required:true,...extra});
const join=(keys:string[],sep=' ')=>(v:Record<string,string>)=>keys.map(k=>v[k]||'').join(sep);

const zones=['UTC','America/Sao_Paulo','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Mexico_City','America/Argentina/Buenos_Aires','Europe/London','Europe/Paris','Europe/Berlin','Europe/Madrid','Europe/Rome','Africa/Cairo','Africa/Johannesburg','Asia/Dubai','Asia/Kolkata','Asia/Shanghai','Asia/Tokyo','Asia/Seoul','Asia/Singapore','Australia/Sydney','Pacific/Auckland'];

export function getToolFormOverride(tool:Tool,locale:Locale):ToolFormSpec|undefined{
 const s=tool.slug;
 if(s==='percentage-calculator')return{fields:[f(locale,'percent','number',{step:.01}),f(locale,'value','number',{step:.01})],serialize:join(['percent','value'])};
 if(s==='fraction-calculator')return{fields:[f(locale,'numerator','number',{step:.01}),f(locale,'denominator','number',{step:.01})],serialize:join(['numerator','denominator'])};
 if(['single-rule-of-three-direct','single-rule-of-three-inverse'].includes(s))return{fields:[f(locale,'a','number',{step:.01}),f(locale,'b','number',{step:.01}),f(locale,'c','number',{step:.01})],serialize:join(['a','b','c'])};
 if(s==='time-zone-offset-calculator')return{fields:[f(locale,'timezone','select',{options:zones.map(z=>({value:z,label:z})),defaultValue:'America/Sao_Paulo'}),f(locale,'datetime','datetime-local',{defaultValue:new Date().toISOString().slice(0,16)})],serialize:join(['timezone','datetime'],'|')};
 if(s==='nanoid-generator')return{fields:[f(locale,'length','number',{min:1,max:256,step:1,defaultValue:'21'})],serialize:v=>v.length};
 if(s==='xml-to-json'||s==='xml-formatter'||s==='xml-minifier')return{fields:[f(locale,'xml','textarea')],serialize:v=>v.xml};
 if(s==='yaml-to-json'||s==='yaml-validator')return{fields:[f(locale,'yaml','textarea')],serialize:v=>v.yaml};
 if(['json-to-csv','json-to-xml','json-to-yaml','json-to-query-string','json-flatten','json-unflatten','json-key-extractor','json-value-extractor'].includes(s))return{fields:[f(locale,'json','textarea')],serialize:v=>v.json};
 if(s==='query-string-to-json')return{fields:[f(locale,'query','text',{placeholder:'name=Ana&age=31'})],serialize:v=>v.query};
 if(s==='tsv-to-csv')return{fields:[f(locale,'tsv','textarea')],serialize:v=>v.tsv};
 if(['csv-to-json','csv-viewer','csv-to-tsv','data-table-to-markdown'].includes(s))return{fields:[f(locale,'csv','textarea')],serialize:v=>v.csv};
 if(['markdown-table-generator','html-table-generator'].includes(s))return{fields:[f(locale,'csv','textarea',{placeholder:'name,age\nAna,31'})],serialize:v=>v.csv};
 if(s==='html-to-markdown'||s==='html-to-text'||s==='html-editor')return{fields:[f(locale,'html','textarea')],serialize:v=>v.html};
 if(s==='markdown-to-html'||s==='markdown-to-text'||s==='markdown-editor'||s==='markdown-preview')return{fields:[f(locale,'markdown','textarea')],serialize:v=>v.markdown};
 return undefined;
}
