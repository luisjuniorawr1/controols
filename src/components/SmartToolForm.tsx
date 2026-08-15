'use client';

import { useMemo, useState } from 'react';
import type { Locale, Tool } from '@/src/data/catalog';
import { copy } from '@/src/i18n';
import { runTool } from '@/src/lib/allExecutors';
import { getToolFormSpec, type FieldSpec } from '@/src/data/toolFormSchemas';

function initialValue(field:FieldSpec){return field.defaultValue??''}
function numericList(value:string){return value.replace(/[^0-9eE+.,;\-\s]/g,'')}

export default function SmartToolForm({tool,locale}:{tool:Tool;locale:Locale}){
  const t=copy[locale],spec=useMemo(()=>getToolFormSpec(tool,locale),[tool,locale]);
  const [values,setValues]=useState<Record<string,string>>(()=>Object.fromEntries(spec.fields.map(x=>[x.key,initialValue(x)])));
  const [output,setOutput]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const valid=spec.allowEmpty||spec.fields.every(field=>!field.required||String(values[field.key]??'').trim()!=='');
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
  const common={id:`tool-${field.key}`,value,onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>onChange(e.target.value),required:field.required!==false};
  return <label className={`smart-field smart-field-${field.kind}`} htmlFor={`tool-${field.key}`}><span>{field.label}</span>
    {field.kind==='textarea'||field.kind==='number-list'?<textarea {...common} inputMode={field.kind==='number-list'?'decimal':undefined} placeholder={field.placeholder}/>:field.kind==='select'?<select {...common}>{(field.options||[]).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:field.kind==='color'?<div className="color-control"><input {...common} type="color"/><output>{value||'#000000'}</output></div>:<input {...common} type={field.kind} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder} inputMode={field.kind==='number'?'decimal':undefined}/>}</label>
}
