import { exampleForCategory as coreExample, runTool as runCore } from './executors';
import { runDesign, runGeo, runSecurity, runUnit } from './extraExecutors';
import { runData, runDocument } from './contentExecutors';

export async function runTool(slug:string,category:string,input:string):Promise<string>{
  if(category==='design') return runDesign(slug,input);
  if(category==='unit') return runUnit(slug,input);
  if(category==='security') return runSecurity(slug,input);
  if(category==='geo') return runGeo(slug,input);
  if(category==='data') return runData(slug,input);
  if(category==='document') return runDocument(slug,input);
  return runCore(slug,category,input);
}

export function exampleForCategory(category:string){
  if(category==='unit') return '10 km mi';
  if(category==='design') return '#22C55E';
  if(category==='security') return 'Controols';
  if(category==='geo') return '-7.0769, -41.4669, -5.0919, -42.8034';
  if(category==='data') return 'name,age\nAna,31\nCarlos,28';
  if(category==='document') return '# Hello Controols\n\nWrite or paste your content here.';
  return coreExample(category);
}
