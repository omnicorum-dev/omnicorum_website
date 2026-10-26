// =========================================================
// Cloudflare Pages Function — GET /api/latest-videos
// Reads the channel's public YouTube feed on Cloudflare's side
// (browsers aren't allowed to read it directly) and returns the
// newest videos as JSON for the Socials page grid.
// =========================================================

const CHANNEL_ID = "UCO51eYgFVtsaxpWaUeAgHew"; // youtube.com/@omnicorum
const COUNT = 4;                               // how many videos to return
const CACHE_SECONDS = 1800;                    // re-check YouTube at most every 30 min

export async function onRequestGet() {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  try {
    const res = await fetch(feedUrl, { cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true } });
    if (!res.ok) throw new Error(`YouTube feed returned ${res.status}`);
    const xml = await res.text();

    const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
      .slice(0, COUNT)
      .map(([, entry]) => ({
        id: pick(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/),
        title: decodeEntities(pick(entry, /<title>([^<]*)<\/title>/)),
        published: pick(entry, /<published>([^<]+)<\/published>/),
      }))
      .filter((video) => video.id);

    return json({ videos }, 200, `public, max-age=${CACHE_SECONDS}`);
  } catch (err) {
    return json({ videos: [], error: String(err?.message || err) }, 502, "no-store");
  }
}

function pick(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1] : "";
}

function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function json(data, status, cacheControl) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cacheControl },
  });
}
