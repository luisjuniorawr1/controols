'use client';

import { useMemo, useState } from 'react';
import type { Locale, Tool } from '@/src/data/catalog';
import { copy } from '@/src/i18n';
import { runTool } from '@/src/lib/allExecutors';
import { getToolFormSpec, type FieldSpec } from '@/src/data/toolFormSchemas';
import { getToolFormOverride } from '@/src/data/toolFormOverrides';

function initialValue(field:FieldSpec){return field.defaultValue??''}
function numericList(value:string){return value.replace(/[^0-9eE+.,;\-\s]/g,'')}
function isNumericList(value:string){const parts=value.trim().split(/[;,\s]+/).filter(Boolean);return parts.length>0&&parts.every(x=>/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(x))}
function fieldValid(field:FieldSpec,value:string){
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
  return true;
}

export default function SmartToolForm({tool,locale}:{tool:Tool;locale:Locale}){
  const t=copy[locale],spec=useMemo(()=>getToolFormOverride(tool,locale)||getToolFormSpec(tool,locale),[tool,locale]);
  const [values,setValues]=useState<Record<string,string>>(()=>Object.fromEntries(spec.fields.map(x=>[x.key,initialValue(x)])));
  const [output,setOutput]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const valid=spec.allowEmpty||spec.fields.every(field=>fieldValid(field,values[field.key]??''));
  function update(field:FieldSpec,value:string){setValues(v=>({...v,[field.key]:field.kind==='number-list'?numericList(value):value}));setOutput('');setError('')}
  function clear(){setValues(Object.fromEntries(spec.fields.map(x=>[x.key,initialValue(x)])));setOutput('');setError('')}
  async function execute(){if(!valid)return;setBusy(true);setError('');try{const input=spec.serialize(values);setOutput(await runTool(tool.slug,tool.category,input))}catch(e){setError(e instanceof Error?e.message:'Unable to process this value.')}finally{setBusy(false)}}
  return <section className="runner smart-form-runner">
    {spec.fields.length>0&&<div className="smart-fields">{spec.fields.map(field=><Field key={field.key} field={field} value={values[field.key]??''} onChange={value=>update(field,value)}/>)}</div>}
    <div className="runner-actions"><button className="primary" onClick={execute} disabled={busy||!valid}>{busy?'…':t.run}</button>{spec.fields.length>0&&<button onClick={clear}>{t.clear}</button>}</div>
    {error&&<div className="form-error" role="alert">{error}</div>}
    {output&&<div className="simple-output"><pre className="result-text">{output}</pre><button onClick={()=>navigator.clipboard.writeText(output)}>{t.copy}</button></div>}
  </section>
}

function Field({field,value,onChange}:{field:FieldSpec;value:string;onChange:(value:string)=>void}){
  const invalid=Boolean(value)&&!fieldValid(field,value),common={id:`tool-${field.key}`,value,onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>onChange(e.target.value),required:field.required!==false,'aria-invalid':invalid};
  return <label className={`smart-field smart-field-${field.kind}${invalid?' invalid':''}`} htmlFor={`tool-${field.key}`}><span>{field.label}</span>
    {field.kind==='textarea'||field.kind==='number-list'?<textarea {...common} inputMode={field.kind==='number-list'?'decimal':undefined} placeholder={field.placeholder}/>:field.kind==='select'?<select {...common}>{(field.options||[]).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:field.kind==='color'?<div className="color-control"><input {...common} type="color"/><output>{value||'#000000'}</output></div>:<input {...common} type={field.kind} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder} inputMode={field.kind==='number'?'decimal':undefined}/>}</label>
}
