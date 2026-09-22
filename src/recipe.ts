export const ingredients = [
 {id:'salad',name:'Bramborový salát',short:'Salát',unit:'g',amount:35,group:'spread'},
 {id:'butter',name:'Máslo',short:'Máslo',unit:'g',amount:8,group:'spread'},
 {id:'cheeseSpread',name:'Sýrová pomazánka',short:'Pomazánka',unit:'g',amount:25,group:'spread'},
 {id:'ham',name:'Šunka',short:'Šunka',unit:'g',amount:20,group:'topping'},
 {id:'salami',name:'Salám',short:'Salám',unit:'g',amount:15,group:'topping'},
 {id:'egg',name:'Vejce',short:'Vejce',unit:'ks',amount:.25,group:'topping'},
 {id:'cheese',name:'Plátkový sýr',short:'Sýr',unit:'g',amount:15,group:'topping'},
 {id:'pickle',name:'Kyselá okurka',short:'Okurka',unit:'ks',amount:.25,group:'topping'},
 {id:'pepper',name:'Červená paprika',short:'Paprika',unit:'ks',amount:.125,group:'topping'},
 {id:'tomato',name:'Rajče',short:'Rajče',unit:'ks',amount:.25,group:'topping'},
 {id:'parsley',name:'Petrželka',short:'Petrželka',unit:'snítky',amount:1,group:'topping'},
 {id:'pineapple',name:'Ananas',short:'Ananas',unit:'g',amount:15,group:'topping'},
] as const;
export type IngredientId=typeof ingredients[number]['id'];
export type Recipe={spread:IngredientId|null;toppings:IngredientId[];positions?:[number,number][]};
export const emptyRecipe:Recipe={spread:null,toppings:[]};
export const presets:Record<string,Recipe>={
 'Česká klasika':{spread:'salad',toppings:['ham','egg','pickle','pepper','parsley']},
 'Bez šunky':{spread:'cheeseSpread',toppings:['cheese','egg','tomato','parsley']},
 'Rodinný rozkol':{spread:'butter',toppings:['ham','cheese','pineapple','pickle']},
};
export function toggle(recipe:Recipe,id:IngredientId):Recipe{const item=ingredients.find(i=>i.id===id)!;return item.group==='spread'?{...recipe,spread:recipe.spread===id?null:id}:{...recipe,toppings:recipe.toppings.includes(id)?recipe.toppings.filter(t=>t!==id):[...recipe.toppings,id]};}
export function verdict(r:Recipe){
 if(!r.spread&&!r.toppings.length)return {title:'Zatím jen veka.',text:'Každý velký chlebíček někde začíná. Tenhle právě teď.',badge:'Čisté plátno'};
 if(r.toppings.includes('pineapple'))return {title:'Rodina se rozdělila.',text:'Jedna půlka chce recept. Druhá svolává mimořádnou schůzi. Ananas má tu moc.',badge:'Odvážné sousto'};
 if(r.toppings.length>=7)return {title:'Statik už je na cestě.',text:'Tohle není svačina. Tohle potřebuje stavební povolení a obě ruce.',badge:'Vysoká gastronomie'};
 if(!r.spread)return {title:'Drží to silou vůle.',text:'Hezká sestava. Teď ještě trochu pomazánky, ať první sousto není lavina.',badge:'Suchý humor'};
 if(r.toppings.includes('ham')&&r.toppings.includes('egg')&&r.toppings.includes('pickle'))return {title:'Babička přikyvuje.',text:'Šunka, vejce, okurka. Na oslavě zmizí jako první. A nikdo se nebude ptát proč.',badge:'Schváleno oslavou'};
 if(r.toppings.length===0)return {title:'Minimalismus chutná.',text:'Veka a něco dobrého navrch. Proč komplikovat věci, které fungují?',badge:'Méně je někdy víc'};
 if(!r.toppings.includes('ham')&&!r.toppings.includes('salami'))return {title:'Zahrádka na návštěvě.',text:'Barvy máš. Chuť taky. Šunka dneska dostala volno.',badge:'Svěží sestava'};
 return {title:'Tenhle má potenciál.',text:'Vlastní rukopis, poctivá veka. Teď už jen najít dost velký talíř.',badge:'Tvoje specialita'};
}
export function shopping(r:Recipe,count:number){const n=Math.max(1,Math.min(24,Math.round(count)||1));return [{name:'Veka',quantity:n,unit:'plátků'},...ingredients.filter(i=>i.id===r.spread||r.toppings.includes(i.id)).map(i=>({name:i.name,quantity:Math.ceil(i.amount*n),unit:i.unit}))];}
export function encode(r:Recipe){return '#'+encodeURIComponent(JSON.stringify(r));}
export function decode(hash:string):Recipe|null{try{if(hash.length>200000)return null;const r=JSON.parse(decodeURIComponent(hash.slice(1)));if(!r||!Array.isArray(r.toppings))return null;if(r.spread!==null&&!ingredients.some(i=>i.id===r.spread&&i.group==='spread'))return null;if(!r.toppings.every((id:unknown)=>ingredients.some(i=>i.id===id&&i.group==='topping')))return null;if(r.positions!==undefined&&(!Array.isArray(r.positions)||r.positions.length!==r.toppings.length||!r.positions.every((p:unknown)=>Array.isArray(p)&&p.length===2&&p.every(v=>typeof v==='number'&&Number.isFinite(v))&&p[0]>=65&&p[0]<=595&&p[1]>=65&&p[1]<=355)))return null;return {spread:r.spread,toppings:r.toppings,...(r.positions?{positions:r.positions}:{})};}catch{return null;}}
export const spots:Record<string,[number,number,number,number]>={ham:[250,224,-10,1.6],salami:[350,253,8,1.25],egg:[337,200,0,1.25],cheese:[214,224,-10,1.4],pickle:[414,212,10,1.15],pepper:[437,259,15,1.1],tomato:[187,270,-12,1.05],parsley:[485,216,15,1],pineapple:[302,293,10,1.1]};
export function position(r:Recipe,index:number):[number,number]{return r.positions?.[index]??[spots[r.toppings[index]][0],spots[r.toppings[index]][1]];}
export function addPiece(r:Recipe,id:IngredientId):Recipe{if(ingredients.find(i=>i.id===id)?.group==='spread')return toggle(r,id);const count=r.toppings.filter(t=>t===id).length;return {...r,toppings:[...r.toppings,id],positions:[...r.toppings.map((_,i)=>position(r,i)),[spots[id][0]+(count%5)*12,spots[id][1]+(count%4)*10]]};}
export function movePiece(r:Recipe,index:number,x:number,y:number):Recipe{return {...r,positions:r.toppings.map((_,i)=>i===index?[Math.max(65,Math.min(595,x)),Math.max(65,Math.min(355,y))]:position(r,i))};}
export function removePiece(r:Recipe,index:number):Recipe{return {...r,toppings:r.toppings.filter((_,i)=>i!==index),positions:r.toppings.map((_,i)=>position(r,i)).filter((_,i)=>i!==index)};}
