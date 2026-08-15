'use client';

import { useMemo, useState } from 'react';
import type { Locale, Tool } from '@/src/data/catalog';
import { copy } from '@/src/i18n';
import { runTool } from '@/src/lib/allExecutors';
import { getToolFormSpec, type FieldSpec } from '@/src/data/toolFormSchemas';
import { getToolFormOverride } from '@/src/data/toolFormOverrides';
import { getExpansionToolFormSpec } from '@/src/data/expansionToolFormSchemas';
import RangeNumberControl from '@/src/components/RangeNumberControl';

function initialValue(field:FieldSpec){return field.defaultValue??''}
function numericList(value:string){return value.replace(/[^0-9eE+.,;\-\s]/g,'')}
function isNumericList(value:string){const parts=value.trim().split(/[;,\s]+/).filter(Boolean);return parts.length>0&&parts.every(x=>/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(x))}
function semanticPattern(slug:string){const p:Record<string,RegExp>={
  'binary-to-decimal':/^[01]+$/,
  'binary-to-text':/^(?:[01]{8})(?:\s+[01]{8})*$/,
  'hex-to-decimal':/^[0-9a-f]+$/i,
  'hex-to-text':/^(?:[0-9a-f]{2})+$/i,
  'jwt-decoder':/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/,
  'base64-decode':/^[A-Za-z0-9+/_=-]+$/,
  'base32-decode':/^[A-Z2-7=\s]+$/i,
  'morse-to-text':/^[.\-/\s]+$/,
  'roman-numerals-converter':/^(?:\d+|[IVXLCDM]+)$/i,
  'hexadecimal-converter':/^[0-9a-f]+$/i,
  'binary-converter':/^\d+$/
};return p[slug]}
function fieldValid(field:FieldSpec,value:string,slug:string){
  const s=String(value??'').trim();
  if(!s)return field.required===false;
  if(field.kind==='number'){const n=Number(s);if(!Number.isFinite(n))return false;if(field.min!==undefined&&n<field.min)return false;if(field.max!==undefined&&n>field.max)return false;return true}
  if(field.kind==='number-list')return isNumericList(s);
  if(field.kind==='date'||field.kind==='datetime-local')return !Number.isNaN(Date.parse(s));
  if(field.kind==='time')return /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(s);
  if(field.kind==='email')return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  if(field.kind==='url'){try{const u=new URL(s);return Boolean(u.protocol&&u.hostname)}catch{return false}}
  if(field.kind==='color')return /^#[0-9a-f]{6}$/i.test(s);
  if(field.key==='expression')return /^[0-9+\-*/().%^\s]+$/.test(s);
  const pattern=semanticPattern(slug);if(pattern&&!pattern.test(s.replace(/\s+/g,slug==='binary-to-text'||slug==='base32-decode'||slug==='morse-to-text'?' ':'').trim()))return false;
  return true;
}

const sliderFieldKeys=new Set(['brightness','contrast','saturation','grayscale','blur','angle','opacity','hue','gamma','threshold','levels','tolerance','spread']);
function shouldUseSlider(field:FieldSpec){return field.kind==='number'&&field.min!==undefined&&field.max!==undefined&&sliderFieldKeys.has(field.key)}

const listCopy:Record<Locale,{number:string;add:string;remove:string;paste:string;pasteTitle:string;pasteHelp:string;apply:string}>={
  en:{number:'Number',add:'Add number',remove:'Remove',paste:'Paste a list',pasteTitle:'Paste multiple numbers',pasteHelp:'Paste numbers separated by commas, spaces or line breaks.',apply:'Apply list'},
  pt:{number:'Número',add:'Adicionar número',remove:'Remover',paste:'Colar uma lista',pasteTitle:'Colar vários números',pasteHelp:'Cole números separados por vírgulas, espaços ou quebras de linha.',apply:'Aplicar lista'},
  es:{number:'Número',add:'Añadir número',remove:'Eliminar',paste:'Pegar una lista',pasteTitle:'Pegar varios números',pasteHelp:'Pega números separados por comas, espacios o saltos de línea.',apply:'Aplicar lista'},
  zh:{number:'数字',add:'添加数字',remove:'删除',paste:'粘贴列表',pasteTitle:'粘贴多个数字',pasteHelp:'可用逗号、空格或换行分隔数字。',apply:'应用列表'},
  hi:{number:'संख्या',add:'संख्या जोड़ें',remove:'हटाएँ',paste:'सूची पेस्ट करें',pasteTitle:'कई संख्याएँ पेस्ट करें',pasteHelp:'संख्याओं को कॉमा, स्पेस या नई पंक्ति से अलग करके पेस्ट करें।',apply:'सूची लागू करें'}
};

function listSlots(value:string,minSlots=3){
  const parsed=value.trim()?value.split(/\r?\n|\s*[,;]\s*/).map(x=>x.trim()):[];
  const slots=parsed.length?parsed:['','',''];
  while(slots.length<minSlots)slots.push('');
  return slots.slice(0,100);
}
function serializeSlots(values:string[]){return values.map(x=>x.trim()).join('\n')}
function parsePastedNumbers(value:string){return value.split(/[;,\s]+/).map(x=>x.trim()).filter(Boolean).slice(0,100)}

export default function SmartToolForm({tool,locale}:{tool:Tool;locale:Locale}){
  const t=copy[locale],spec=useMemo(()=>getToolFormOverride(tool,locale)||getExpansionToolFormSpec(tool,locale)||getToolFormSpec(tool,locale),[tool,locale]);
  const [values,setValues]=useState<Record<string,string>>(()=>Object.fromEntries(spec.fields.map(x=>[x.key,initialValue(x)])));
  const [output,setOutput]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const valid=spec.allowEmpty||spec.fields.every(field=>fieldValid(field,values[field.key]??'',tool.slug));
  function update(field:FieldSpec,value:string){setValues(v=>({...v,[field.key]:field.kind==='number-list'?numericList(value):value}));setOutput('');setError('')}
  function clear(){setValues(Object.fromEntries(spec.fields.map(x=>[x.key,initialValue(x)])));setOutput('');setError('')}
  async function execute(){if(!valid)return;setBusy(true);setError('');try{const input=spec.serialize(values);setOutput(await runTool(tool.slug,tool.category,input))}catch(e){setError(e instanceof Error?e.message:'Unable to process this value.')}finally{setBusy(false)}}
  return <section className="runner smart-form-runner">
    {spec.fields.length>0&&<div className="smart-fields">{spec.fields.map(field=><Field key={field.key} field={field} value={values[field.key]??''} toolSlug={tool.slug} locale={locale} onChange={value=>update(field,value)}/>)}</div>}
    <div className="runner-actions"><button className="primary" onClick={execute} disabled={busy||!valid}>{busy?'…':t.run}</button>{spec.fields.length>0&&<button onClick={clear}>{t.clear}</button>}</div>
    {error&&<div className="form-error" role="alert">{error}</div>}
    {output&&<div className="simple-output"><pre className="result-text">{output}</pre><button onClick={()=>navigator.clipboard.writeText(output)}>{t.copy}</button></div>}
  </section>
}

function NumberListField({field,value,locale,onChange}:{field:FieldSpec;value:string;locale:Locale;onChange:(value:string)=>void}){
  const c=listCopy[locale],[pasteOpen,setPasteOpen]=useState(false),[draft,setDraft]=useState('');
  const slots=listSlots(value);
  const updateSlot=(index:number,next:string)=>{const copy=[...slots];copy[index]=next;onChange(serializeSlots(copy))};
  const add=()=>{if(slots.length>=100)return;onChange(serializeSlots([...slots,'']))};
  const remove=(index:number)=>{const next=slots.filter((_,i)=>i!==index);onChange(serializeSlots(next.length?next:['']))};
  const openPaste=()=>{setDraft(slots.filter(Boolean).join('\n'));setPasteOpen(x=>!x)};
  const applyPaste=()=>{const parsed=parsePastedNumbers(draft);onChange(serializeSlots(parsed.length?parsed:['','','']));setPasteOpen(false)};
  const invalid=Boolean(value.trim())&&!isNumericList(value);
  return <div className={`smart-field smart-field-number-list repeatable-number-list${invalid?' invalid':''}`}>
    <div className="repeatable-list-heading"><span>{field.label}</span><button type="button" className="quiet-link" onClick={openPaste}>{c.paste}</button></div>
    <div className="repeatable-list-grid">
      {slots.map((slot,index)=><div className="repeatable-number-row" key={index}>
        <label><span>{c.number} {index+1}</span><input type="number" step={field.step??'any'} min={field.min} max={field.max} value={slot} onChange={e=>updateSlot(index,e.target.value)} inputMode="decimal" aria-label={`${c.number} ${index+1}`}/></label>
        <button type="button" className="remove-list-item" onClick={()=>remove(index)} disabled={slots.length<=1} title={c.remove} aria-label={`${c.remove} ${c.number} ${index+1}`}>×</button>
      </div>)}
    </div>
    <button type="button" className="add-list-item" onClick={add}>+ {c.add}</button>
    {pasteOpen&&<div className="paste-list-panel"><strong>{c.pasteTitle}</strong><p>{c.pasteHelp}</p><textarea value={draft} onChange={e=>setDraft(numericList(e.target.value))} inputMode="decimal" autoFocus/><button type="button" className="secondary-small" onClick={applyPaste}>{c.apply}</button></div>}
  </div>
}

function Field({field,value,toolSlug,locale,onChange}:{field:FieldSpec;value:string;toolSlug:string;locale:Locale;onChange:(value:string)=>void}){
  if(field.kind==='number-list')return <NumberListField field={field} value={value} locale={locale} onChange={onChange}/>;
  if(shouldUseSlider(field))return <RangeNumberControl label={field.label} value={value||String(field.min??0)} onChange={onChange} min={field.min!} max={field.max!} step={field.step??1} id={`tool-${field.key}`}/>;
  const invalid=Boolean(value)&&!fieldValid(field,value,toolSlug),common={id:`tool-${field.key}`,value,onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>onChange(e.target.value),required:field.required!==false,'aria-invalid':invalid};
  return <label className={`smart-field smart-field-${field.kind}${invalid?' invalid':''}`} htmlFor={`tool-${field.key}`}><span>{field.label}</span>
    {field.kind==='textarea'?<textarea {...common} placeholder={field.placeholder}/>:field.kind==='select'?<select {...common}>{(field.options||[]).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:field.kind==='color'?<div className="color-control"><input {...common} type="color"/><output>{value||'#000000'}</output></div>:<input {...common} type={field.kind} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder} inputMode={field.kind==='number'?'decimal':undefined}/>}</label>
}
