const VERSION="2026-08-20";

const reply=(data,status=200)=>new Response(
  JSON.stringify(data),
  {
    status,
    headers:{
      "Content-Type":"application/json",
      "Cache-Control":"public,max-age=300,s-maxage=900"
    }
  }
);

const money=m=>
  m&&typeof m.amount==="number"
    ?new Intl.NumberFormat("en-US",{
        style:"currency",
        currency:m.currency||"USD"
      }).format(m.amount/100)
    :null;

const duration=ms=>{
  if(!ms)return null;
  const total=Math.round(ms/60000);
  const h=Math.floor(total/60);
  const m=total%60;
  return h&&m
    ?`${h} hr ${m} min`
    :h
      ?`${h} hr`
      :`${m} min`;
};

export async function onRequestGet({env}){

  const token=env.SQUARE_ACCESS_TOKEN;

  if(!token){
    return reply({
      error:"Token missing",
      services:[]
    },503);
  }

  const r=await fetch(
    "https://connect.squareup.com/v2/catalog/search",
    {
      method:"POST",
      headers:{
        Authorization:`Bearer ${token}`,
        "Square-Version":VERSION,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        object_types:["ITEM"],
        include_related_objects:true,
        include_deleted_objects:false,
        limit:100
      })
    }
  );

  const p=await r.json();

  if(!r.ok){
    return reply({
      error:"Square request failed",
      details:p.errors||p
    },r.status);
  }

  const related=Array.isArray(p.related_objects)
    ?p.related_objects
    :[];

  const images=new Map(
    related
      .filter(o=>o.type==="IMAGE"&&o.image_data?.url)
      .map(o=>[o.id,o.image_data.url])
  );

  const services=(Array.isArray(p.objects)?p.objects:[])
    .filter(o=>o.type==="ITEM"&&!o.is_deleted)
    .map(o=>{

      const d=o.item_data||{};

      const rawVariations=Array.isArray(d.variations)
        ?d.variations.filter(v=>!v.is_deleted)
        :[];

      const variations=rawVariations.map(v=>{

        const vd=v.item_variation_data||{};

        return {
          id:v.id,
          name:vd.name||"Standard",
          pricingType:vd.pricing_type||"FIXED_PRICING",
          price:
            money(vd.price_money)||
            (vd.pricing_type==="VARIABLE_PRICING"
              ?"50% of full-head price"
              :null),
          amount:
            vd.price_money&&typeof vd.price_money.amount==="number"
              ?vd.price_money.amount
              :null,
          currency:vd.price_money?.currency||"USD",
          duration:duration(vd.service_duration),
          durationMs:vd.service_duration||null,
          bookable:vd.available_for_booking!==false
        };

      });

      const fixedPrices=variations
        .filter(v=>typeof v.amount==="number")
        .map(v=>v.amount);

      let displayPrice=null;

      if(
        variations.some(
          v=>v.pricingType==="VARIABLE_PRICING"
        )
      ){
        displayPrice="50% of full-head price";
      }
      else if(fixedPrices.length){
        const minimum=Math.min(...fixedPrices);

        displayPrice=
          fixedPrices.length>1
            ?`From ${money({
                amount:minimum,
                currency:"USD"
              })}`
            :money({
                amount:minimum,
                currency:"USD"
              });
      }

      const durations=variations
        .map(v=>v.durationMs)
        .filter(Boolean);

      const shortestDuration=durations.length
        ?duration(Math.min(...durations))
        :null;

      const imageId=Array.isArray(d.image_ids)
        ?d.image_ids[0]
        :null;

      return {
        id:o.id,
        name:d.name||"Service",
        description:d.description||"",
        price:displayPrice||"View price",
        duration:shortestDuration,
        image:imageId
          ?images.get(imageId)||null
          :null,
        variations
      };

    })
    .filter(
      s=>
        s.name&&
        !/^haircut \(example service\)$/i.test(s.name)
    )
    .sort(
      (a,b)=>
        (b.image?1:0)-(a.image?1:0)||
        a.name.localeCompare(b.name)
    );

  return reply({
    services,
    count:services.length
  });
}
