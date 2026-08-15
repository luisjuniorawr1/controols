import type { CollectionId } from '@/src/data/collections';

export default function CollectionArt({id}:{id:CollectionId}){
  const common=<defs>
    <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#20150f"/><stop offset=".55" stopColor="#111317"/><stop offset="1" stopColor="#090b0e"/></linearGradient>
    <linearGradient id={`orange-${id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ff9a52"/><stop offset="1" stopColor="#ff6a00"/></linearGradient>
    <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>;
  return <svg viewBox="0 0 720 420" role="img" aria-hidden="true" focusable="false" className="collection-art-svg">{common}<rect width="720" height="420" rx="28" fill={`url(#bg-${id})`}/><circle cx="590" cy="92" r="125" fill="#ff7a1a" opacity=".12" filter={`url(#glow-${id})`}/>{draw(id)}</svg>;
}

function draw(id:CollectionId){switch(id){
  case'image-design':return <>
    <rect x="64" y="78" width="360" height="246" rx="22" fill="#171b21" stroke="#343941"/>
    <rect x="82" y="96" width="324" height="210" rx="16" fill="#0d1115"/>
    <circle cx="160" cy="158" r="34" fill="#ff7a1a" opacity=".88"/>
    <path d="M90 286l86-86 57 56 44-39 120 89H90z" fill="#dfe4e8" opacity=".9"/>
    <rect x="357" y="68" width="160" height="104" rx="18" fill="#242931" stroke="#424852" transform="rotate(8 357 68)"/>
    <path d="M402 94h64v50h-64z" fill="none" stroke="#fff" strokeWidth="6"/><path d="M414 84v72M454 84v72" stroke="#ff8b35" strokeWidth="4"/>
    <rect x="442" y="232" width="164" height="102" rx="18" fill="#171b21" stroke="#393f48" transform="rotate(-7 442 232)"/>
    <circle cx="493" cy="282" r="19" fill="#ff7a1a"/><circle cx="532" cy="282" r="19" fill="#ff9a52"/><circle cx="571" cy="282" r="19" fill="#f3f5f7"/>
  </>;
  case'pdf-files':return <>
    <g transform="translate(78 64)"><rect x="56" y="22" width="286" height="300" rx="18" fill="#13171c" stroke="#333943"/><rect x="28" y="10" width="286" height="300" rx="18" fill="#171b21" stroke="#3a414b"/><rect width="286" height="300" rx="18" fill="#1d2228" stroke="#454d57"/>
    <rect x="28" y="30" width="92" height="34" rx="8" fill="#ff7a1a"/><text x="74" y="53" textAnchor="middle" fill="#160902" fontSize="16" fontWeight="900">PDF</text>
    <rect x="28" y="90" width="192" height="11" rx="5" fill="#dfe3e6" opacity=".8"/><rect x="28" y="116" width="228" height="9" rx="4" fill="#7b858f"/><rect x="28" y="140" width="212" height="9" rx="4" fill="#606974"/><rect x="28" y="184" width="230" height="74" rx="12" fill="#111419" stroke="#353b44"/></g>
    <g transform="translate(448 120)"><rect width="178" height="126" rx="20" fill="#171b21" stroke="#3b414a"/><path d="M38 39h102M38 63h102M38 87h70" stroke="#e8ebed" strokeWidth="8" strokeLinecap="round"/><path d="M89 15v96" stroke="#ff7a1a" strokeWidth="5" strokeDasharray="7 8"/></g>
  </>;
  case'video-audio':return <>
    <rect x="58" y="72" width="430" height="240" rx="24" fill="#11151a" stroke="#343b44"/><rect x="78" y="92" width="390" height="182" rx="17" fill="#0a0d11"/><circle cx="273" cy="183" r="49" fill="#ff7a1a"/><path d="M258 154l52 29-52 29z" fill="#170a02"/>
    <rect x="78" y="286" width="390" height="7" rx="4" fill="#303640"/><rect x="78" y="286" width="227" height="7" rx="4" fill="#ff7a1a"/>
    <g transform="translate(424 228)"><rect width="230" height="116" rx="20" fill="#1b2026" stroke="#404750"/><path d="M18 61h14l8-28 14 55 15-39 14 20 13-42 15 62 13-46 14 24 12-35 15 59 10-30h17" fill="none" stroke="#ff8e3d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></g>
  </>;
  case'text-data':return <>
    <rect x="64" y="72" width="302" height="260" rx="22" fill="#15191e" stroke="#353c45"/><text x="96" y="142" fill="#f3f5f7" fontSize="64" fontWeight="800">Aa</text><rect x="96" y="171" width="206" height="12" rx="6" fill="#e8ebed" opacity=".88"/><rect x="96" y="200" width="178" height="10" rx="5" fill="#75808b"/><rect x="96" y="225" width="214" height="10" rx="5" fill="#5d6670"/><rect x="96" y="250" width="160" height="10" rx="5" fill="#5d6670"/>
    <g transform="translate(390 105)"><rect width="255" height="202" rx="20" fill="#1b2026" stroke="#404750"/><path d="M0 56h255M0 108h255M0 160h255M85 0v202M170 0v202" stroke="#3e454e" strokeWidth="2"/><rect x="18" y="19" width="48" height="18" rx="5" fill="#ff7a1a"/><rect x="103" y="72" width="48" height="18" rx="5" fill="#ff9a52"/><rect x="188" y="124" width="48" height="18" rx="5" fill="#f3f5f7" opacity=".84"/></g>
  </>;
  case'dev-security':return <>
    <rect x="58" y="70" width="408" height="270" rx="24" fill="#0e1217" stroke="#343b44"/><circle cx="88" cy="99" r="6" fill="#ff7a1a"/><circle cx="109" cy="99" r="6" fill="#6d737b"/><circle cx="130" cy="99" r="6" fill="#6d737b"/>
    <path d="M105 158l-38 35 38 35M205 158l38 35-38 35M173 140l-36 107" fill="none" stroke="#f2f4f6" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="282" y="144" width="130" height="14" rx="7" fill="#ff7a1a"/><rect x="282" y="181" width="104" height="11" rx="6" fill="#8a949e"/><rect x="282" y="214" width="82" height="11" rx="6" fill="#626c76"/>
    <g transform="translate(451 169)"><path d="M52 0c43 0 78 35 78 78v22c0 52-35 99-78 117C9 199-26 152-26 100V78C-26 35 9 0 52 0z" fill="#20252b" stroke="#49515b" strokeWidth="3"/><rect x="20" y="82" width="64" height="57" rx="14" fill="#ff7a1a"/><path d="M31 82V65c0-16 9-29 21-29s21 13 21 29v17" fill="none" stroke="#ff9b57" strokeWidth="10" strokeLinecap="round"/></g>
  </>;
  case'calculations-utilities':return <>
    <rect x="62" y="74" width="290" height="270" rx="24" fill="#171b21" stroke="#3a414a"/><rect x="88" y="101" width="238" height="60" rx="12" fill="#0b0e12"/><text x="306" y="143" textAnchor="end" fill="#ff8b35" fontSize="31" fontWeight="800">42.75</text>
    {[0,1,2,3].map(r=>[0,1,2].map(c=><rect key={`${r}-${c}`} x={88+c*61} y={182+r*37} width="48" height="27" rx="8" fill={c===2?'#ff7a1a':'#252a31'}/>))}
    <g transform="translate(396 92)"><rect width="246" height="226" rx="22" fill="#11151a" stroke="#363d46"/><path d="M34 178V62M34 178h177" stroke="#707b86" strokeWidth="3"/><rect x="59" y="131" width="28" height="47" rx="7" fill="#795030"/><rect x="105" y="95" width="28" height="83" rx="7" fill="#a85f28"/><rect x="151" y="54" width="28" height="124" rx="7" fill="#ff7a1a"/><path d="M55 111l60-35 47-29 46-22" fill="none" stroke="#ffb27b" strokeWidth="5" strokeLinecap="round"/></g>
  </>;
}}
