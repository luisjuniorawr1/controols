import { exampleForCategory as coreExample, runTool as runCore } from './executors';
import { runDesign, runGeo, runSecurity, runUnit } from './extraExecutors';

export async function runTool(slug:string,category:string,input:string):Promise<string>{
  if(category==='design') return runDesign(slug,input);
  if(category==='unit') return runUnit(slug,input);
  if(category==='security') return runSecurity(slug,input);
  if(category==='geo') return runGeo(slug,input);
  return runCore(slug,category,input);
}

export function exampleForCategory(category:string){
  if(category==='unit') return '10 km mi';
  if(category==='design') return '#22C55E';
  if(category==='security') return 'Controols';
  if(category==='geo') return '-7.0769, -41.4669, -5.0919, -42.8034';
  return coreExample(category);
}
