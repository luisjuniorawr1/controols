'use client';

import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Locale } from '@/src/data/catalog';

const GUI='br.gov.bcb.pix';
const encoder=new TextEncoder();

type PixValues={key:string;name:string;city:string;amount:string;txid:string;description:string};
type Copy={pixKey:string;recipient:string;city:string;amount:string;amountHint:string;txid:string;txidHint:string;description:string;descriptionHint:string;generate:string;copy:string;copied:string;download:string;payload:string;notice:string;required:string;invalidKey:string;invalidAmount:string;merchantDataTooLong:string;qrError:string};

const C:Record<Locale,Copy>={
  en:{pixKey:'Pix key',recipient:'Recipient name',city:'Recipient city',amount:'Amount (BRL) — optional',amountHint:'Example: 49.90',txid:'Transaction ID (txid) — optional',txidHint:'Up to 25 letters or numbers',description:'Description — optional',descriptionHint:'Shown as additional information when supported',generate:'Generate Pix QR Code',copy:'Copy Pix Copy & Paste',copied:'Copied!',download:'Download QR Code',payload:'Pix Copy & Paste',notice:'Generated locally in your browser. Controols does not check whether the Pix key is registered in DICT. Always confirm the recipient in your bank app before paying.',required:'Enter the Pix key, recipient name and city.',invalidKey:'Enter a Pix key with up to 77 characters and no spaces.',invalidAmount:'Enter a positive amount with at most two decimal places.',merchantDataTooLong:'The Pix key and description together exceed the BR Code size limit. Shorten the description.',qrError:'Unable to generate this Pix QR Code.'},
  pt:{pixKey:'Chave Pix',recipient:'Nome do recebedor',city:'Cidade do recebedor',amount:'Valor (R$) — opcional',amountHint:'Exemplo: 49,90',txid:'Identificador (txid) — opcional',txidHint:'Até 25 letras ou números',description:'Descrição — opcional',descriptionHint:'Informação adicional exibida quando suportada',generate:'Gerar QR Code Pix',copy:'Copiar Pix Copia e Cola',copied:'Copiado!',download:'Baixar QR Code',payload:'Pix Copia e Cola',notice:'Gerado localmente no navegador. O Controols não consulta o DICT para confirmar se a chave Pix está registrada. Antes de pagar, confira o nome do recebedor no aplicativo do seu banco.',required:'Informe a chave Pix, o nome do recebedor e a cidade.',invalidKey:'Informe uma chave Pix com até 77 caracteres e sem espaços.',invalidAmount:'Informe um valor positivo com no máximo duas casas decimais.',merchantDataTooLong:'A chave Pix e a descrição ultrapassam o limite do BR Code. Reduza a descrição.',qrError:'Não foi possível gerar este QR Code Pix.'},
  es:{pixKey:'Clave Pix',recipient:'Nombre del receptor',city:'Ciudad del receptor',amount:'Importe (BRL) — opcional',amountHint:'Ejemplo: 49,90',txid:'Identificador (txid) — opcional',txidHint:'Hasta 25 letras o números',description:'Descripción — opcional',descriptionHint:'Información adicional cuando sea compatible',generate:'Generar QR Code Pix',copy:'Copiar Pix Copia y Pega',copied:'¡Copiado!',download:'Descargar QR Code',payload:'Pix Copia y Pega',notice:'Se genera localmente en el navegador. Controols no comprueba si la clave Pix está registrada en DICT. Confirma siempre el receptor en la app de tu banco antes de pagar.',required:'Introduce la clave Pix, el nombre del receptor y la ciudad.',invalidKey:'Introduce una clave Pix de hasta 77 caracteres y sin espacios.',invalidAmount:'Introduce un importe positivo con hasta dos decimales.',merchantDataTooLong:'La clave Pix y la descripción superan el límite de BR Code. Reduce la descripción.',qrError:'No se pudo generar este QR Code Pix.'},
  zh:{pixKey:'Pix 密钥',recipient:'收款人姓名',city:'收款人城市',amount:'金额（BRL，可选）',amountHint:'例如：49.90',txid:'交易标识（txid，可选）',txidHint:'最多 25 个字母或数字',description:'说明（可选）',descriptionHint:'在支持时作为附加信息显示',generate:'生成 Pix 二维码',copy:'复制 Pix 文本',copied:'已复制！',download:'下载二维码',payload:'Pix 复制粘贴文本',notice:'所有内容均在浏览器本地生成。Controols 不会查询 DICT 来确认 Pix 密钥是否已注册。付款前请务必在银行应用中核对收款人。',required:'请输入 Pix 密钥、收款人姓名和城市。',invalidKey:'请输入不含空格且不超过 77 个字符的 Pix 密钥。',invalidAmount:'请输入正数金额，最多两位小数。',merchantDataTooLong:'Pix 密钥和说明超过 BR Code 长度限制，请缩短说明。',qrError:'无法生成此 Pix 二维码。'},
  hi:{pixKey:'Pix कुंजी',recipient:'प्राप्तकर्ता का नाम',city:'प्राप्तकर्ता का शहर',amount:'राशि (BRL) — वैकल्पिक',amountHint:'उदाहरण: 49.90',txid:'लेन-देन आईडी (txid) — वैकल्पिक',txidHint:'अधिकतम 25 अक्षर या अंक',description:'विवरण — वैकल्पिक',descriptionHint:'समर्थित होने पर अतिरिक्त जानकारी के रूप में दिखता है',generate:'Pix QR Code बनाएँ',copy:'Pix Copy & Paste कॉपी करें',copied:'कॉपी हो गया!',download:'QR Code डाउनलोड करें',payload:'Pix Copy & Paste',notice:'यह आपके ब्राउज़र में स्थानीय रूप से बनाया जाता है। Controols यह जाँच नहीं करता कि Pix कुंजी DICT में पंजीकृत है या नहीं। भुगतान से पहले अपने बैंक ऐप में प्राप्तकर्ता की पुष्टि करें।',required:'Pix कुंजी, प्राप्तकर्ता का नाम और शहर भरें।',invalidKey:'बिना स्पेस वाली अधिकतम 77 अक्षरों की Pix कुंजी दर्ज करें।',invalidAmount:'अधिकतम दो दशमलव वाली धनात्मक राशि दर्ज करें।',merchantDataTooLong:'Pix कुंजी और विवरण BR Code की सीमा से अधिक हैं। विवरण छोटा करें।',qrError:'यह Pix QR Code नहीं बनाया जा सका।'}
};

function bytes(value:string){return encoder.encode(value).length}
function tlv(id:string,value:string){return `${id}${String(bytes(value)).padStart(2,'0')}${value}`}
function cleanMerchant(value:string,max:number){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9 .-]/g,'').replace(/\s+/g,' ').trim().slice(0,max)}
function cleanTxid(value:string){return value.replace(/[^A-Za-z0-9]/g,'').slice(0,25)}
function cleanAmountInput(value:string){const x=value.replace(/[^0-9.,]/g,'').replace(',','.');const [whole,...rest]=x.split('.');return rest.length?`${whole}.${rest.join('').slice(0,2)}`:whole}
function amountForPayload(value:string){if(!value.trim())return'';if(!/^\d+(?:\.\d{1,2})?$/.test(value))throw new Error('amount');const n=Number(value);if(!Number.isFinite(n)||n<=0||n>9999999999.99)throw new Error('amount');return n.toFixed(2)}
function crc16(value:string){let crc=0xffff;for(const b of encoder.encode(value)){crc^=b<<8;for(let i=0;i<8;i++)crc=(crc&0x8000)?((crc<<1)^0x1021)&0xffff:(crc<<1)&0xffff}return crc.toString(16).toUpperCase().padStart(4,'0')}

export function buildPixStaticPayload(values:PixValues){
  const key=values.key.trim();if(!key||bytes(key)>77||/\s/.test(key))throw new Error('key');
  const name=cleanMerchant(values.name,25),city=cleanMerchant(values.city,15);if(!name||!city)throw new Error('required');
  const description=values.description.trim();let merchant=tlv('00',GUI)+tlv('01',key);if(description)merchant+=tlv('02',description);if(bytes(merchant)>99)throw new Error('merchant');
  const amount=amountForPayload(values.amount),txid=cleanTxid(values.txid)||'***';
  let payload=tlv('00','01')+tlv('26',merchant)+tlv('52','0000')+tlv('53','986');
  if(amount)payload+=tlv('54',amount);
  payload+=tlv('58','BR')+tlv('59',name)+tlv('60',city)+tlv('62',tlv('05',txid));
  const beforeCrc=payload+'6304';return beforeCrc+crc16(beforeCrc);
}

export default function PixQrCodeRunner({locale}:{locale:Locale}){
  const t=C[locale];
  const [v,setV]=useState<PixValues>({key:'',name:'',city:'',amount:'',txid:'',description:''});
  const [payload,setPayload]=useState(''),[image,setImage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[copied,setCopied]=useState(false);
  const set=(key:keyof PixValues,value:string)=>setV(x=>({...x,[key]:value}));
  const errorText=useCallback((code:string)=>code==='key'?t.invalidKey:code==='amount'?t.invalidAmount:code==='merchant'?t.merchantDataTooLong:code==='required'?t.required:t.qrError,[t]);
  const generate=useCallback(async(values=v)=>{if(!values.key.trim()||!values.name.trim()||!values.city.trim()){setPayload('');setImage('');setError('');return}setBusy(true);setCopied(false);try{const next=buildPixStaticPayload(values);const data=await QRCode.toDataURL(next,{width:640,margin:2,errorCorrectionLevel:'M'});setPayload(next);setImage(data);setError('')}catch(e){setPayload('');setImage('');setError(errorText(e instanceof Error?e.message:'qr'))}finally{setBusy(false)}},[v,errorText]);
  useEffect(()=>{const timer=window.setTimeout(()=>void generate(v),180);return()=>window.clearTimeout(timer)},[v,generate]);
  async function copyPayload(){if(!payload)return;await navigator.clipboard.writeText(payload);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}
  return <section className="runner asset-runner pix-qr-runner">
    <div className="asset-controls">
      <div className="smart-fields">
        <label className="smart-field smart-field-wide"><span>{t.pixKey}</span><input name="email" value={v.key} onChange={e=>set('key',e.target.value.trimStart())} maxLength={77} placeholder="email@exemplo.com · +5511999999999 · CPF/CNPJ · chave aleatória" autoComplete="off"/></label>
        <label className="smart-field"><span>{t.recipient}</span><input name="name" value={v.name} onChange={e=>set('name',e.target.value)} maxLength={60} autoComplete="off"/></label>
        <label className="smart-field"><span>{t.city}</span><input name="location" value={v.city} onChange={e=>set('city',e.target.value)} maxLength={40} autoComplete="off"/></label>
        <label className="smart-field"><span>{t.amount}</span><input name="amount" type="text" inputMode="decimal" value={v.amount} onChange={e=>set('amount',cleanAmountInput(e.target.value))} placeholder={t.amountHint} autoComplete="off"/></label>
        <label className="smart-field"><span>{t.txid}</span><input name="title" value={v.txid} onChange={e=>set('txid',cleanTxid(e.target.value))} maxLength={25} placeholder={t.txidHint} autoComplete="off"/></label>
        <label className="smart-field smart-field-wide"><span>{t.description}</span><textarea name="text" value={v.description} onChange={e=>set('description',e.target.value)} maxLength={72} placeholder={t.descriptionHint}/></label>
      </div>
      <button className="primary" type="button" onClick={()=>void generate(v)} disabled={busy||!v.key.trim()||!v.name.trim()||!v.city.trim()}>{busy?'…':t.generate}</button>
      <p className="tool-note">{t.notice}</p>
    </div>
    {error&&<div className="form-error" role="alert">{error}</div>}
    {(image||payload)&&<div className="asset-result">
      {image&&<img src={image} alt="Pix QR Code"/>}
      <div className="result-summary">{t.payload}</div>
      <textarea readOnly value={payload} aria-label={t.payload}/>
      <div className="runner-actions">
        <button type="button" onClick={()=>void copyPayload()}>{copied?t.copied:t.copy}</button>
        {image&&<a className="download-button" href={image} download="controols-pix-qr-code.png">{t.download}</a>}
      </div>
    </div>}
  </section>
}
