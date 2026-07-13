const SQUARE_API_VERSION = "2026-01-22";

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=900",
      ...extraHeaders
    }
  });
}

function moneyText(money) {
  if (!money || typeof money.amount !== "number") return null;
  const currency = money.currency || "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(money.amount / 100);
}

function durationText(milliseconds) {
  if (!milliseconds || milliseconds < 60000) return null;
  const totalMinutes = Math.round(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return `${hours} hr ${minutes} min`;
  if (hours) return `${hours} hr`;
  return `${minutes} min`;
}

export async function onRequestGet(context) {
  const token = context.env.SQUARE_ACCESS_TOKEN;
  if (!token) {
    return json({
      error: "SQUARE_ACCESS_TOKEN is not configured.",
      services: []
    }, 503);
  }

  const endpoint = "https://connect.squareup.com/v2/catalog/search";
  const body = {
    object_types: ["ITEM"],
    include_related_objects: true,
    include_deleted_objects: false,
    limit: 100
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Square-Version": SQUARE_API_VERSION,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json();

  if (!response.ok) {
    return json({
      error: "Square Catalog API request failed.",
      details: payload?.errors || payload
    }, response.status);
  }

  const related = Array.isArray(payload.related_objects) ? payload.related_objects : [];
  const imageById = new Map(
    related
      .filter(object => object.type === "IMAGE" && object.image_data?.url)
      .map(object => [object.id, object.image_data.url])
  );

  const objects = Array.isArray(payload.objects) ? payload.objects : [];
  const services = objects
    .filter(object => object.type === "ITEM" && !object.is_deleted)
    .map(object => {
      const data = object.item_data || {};
      const variations = Array.isArray(data.variations) ? data.variations : [];
      const firstVariation = variations.find(v => !v.is_deleted)?.item_variation_data || {};
      const imageId = Array.isArray(data.image_ids) ? data.image_ids[0] : null;
      const price = moneyText(firstVariation.price_money);
      const duration = durationText(firstVariation.service_duration);
      return {
        id: object.id,
        name: data.name || "Service",
        description: data.description || "",
        price: price || (firstVariation.pricing_type === "VARIABLE_PRICING" ? "Price varies" : null),
        duration,
        image: imageId ? imageById.get(imageId) || null : null,
        updatedAt: object.updated_at || null
      };
    })
    .filter(service => service.name && !/^haircut \(example service\)$/i.test(service.name))
    .sort((a, b) => {
      if (a.image && !b.image) return -1;
      if (!a.image && b.image) return 1;
      return a.name.localeCompare(b.name);
    });

  return json({ services, count: services.length });
}
