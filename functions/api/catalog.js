const VERSION="2026-01-22";
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"public,max-age=300,s-maxage=900"}});
const money=m=>m&&typeof m.amount==="number"?new Intl.NumberFormat("en-US",{style:"currency",currency:m.currency||"USD"}).format(m.amount/100):null;
const duration=ms=>{if(!ms)return null;const total=Math.round(ms/60000),h=Math.floor(total/60),m=total%60;return h&&m?`${h} hr ${m} min`:h?`${h} hr`:`${m} min`};
export async function onRequestGet({env}){
 const token=env.SQUARE_ACCESS_TOKEN;if(!token)return reply({error:"Token missing",services:[]},503);
 const r=await fetch("https://connect.squareup.com/v2/catalog/search",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Square-Version":VERSION,"Content-Type":"application/json"},body:JSON.stringify({object_types:["ITEM"],include_related_objects:true,include_deleted_objects:false,limit:100})});
 const p=await r.json();if(!r.ok)return reply({error:"Square request failed",details:p.errors||p},r.status);
 const related=Array.isArray(p.related_objects)?p.related_objects:[],images=new Map(related.filter(o=>o.type==="IMAGE"&&o.image_data?.url).map(o=>[o.id,o.image_data.url]));
 const services=(Array.isArray(p.objects)?p.objects:[]).filter(o=>o.type==="ITEM"&&!o.is_deleted).map(o=>{const d=o.item_data||{},vars=Array.isArray(d.variations)?d.variations:[],v=vars.find(x=>!x.is_deleted)?.item_variation_data||{},id=Array.isArray(d.image_ids)?d.image_ids[0]:null;return{id:o.id,name:d.name||"Service",description:d.description||"",price:money(v.price_money)||(v.pricing_type==="VARIABLE_PRICING"?"Price varies":null),duration:duration(v.service_duration),image:id?images.get(id)||null:null}}).filter(s=>s.name&&!/^haircut \(example service\)$/i.test(s.name)).sort((a,b)=>(b.image?1:0)-(a.image?1:0)||a.name.localeCompare(b.name));
 return reply({services,count:services.length});
}