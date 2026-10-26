// =========================================================
// Cloudflare Pages Function — GET /api/latest-videos
// Reads the channel's public YouTube feed on Cloudflare's side
// (browsers aren't allowed to read it directly) and returns the
// newest videos as JSON for the Socials page grid.
//
// YouTube's feed has been flaky since late 2025 (random 404s for
// hours at a time), so this:
//   1. tries two equivalent feed addresses,
//   2. keeps a 7-day backup of the last good result and serves it
//      when YouTube is down (backup works on omnicorum.com; on
//      *.pages.dev preview URLs Cloudflare doesn't keep it),
//   3. never caches a failed response.
// =========================================================

const CHANNEL_ID = "UCO51eYgFVtsaxpWaUeAgHew"; // youtube.com/@omnicorum
const COUNT = 4;                               // how many videos to return
const CACHE_SECONDS = 1800;                    // re-check YouTube at most every 30 min
const BACKUP_SECONDS = 7 * 24 * 60 * 60;       // keep the last good list for 7 days

const FEEDS = [
  `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
  `https://www.youtube.com/feeds/videos.xml?playlist_id=UU${CHANNEL_ID.slice(2)}`, // same uploads, other address
];

export async function onRequestGet({ request, waitUntil }) {
  const cache = caches.default;
  const backupKey = new Request(new URL("/api/latest-videos/backup", request.url).toString());
  const attempts = [];

  for (const feedUrl of FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; omnicorum.com latest-videos)" },
        cf: { cacheTtlByStatus: { "200-299": CACHE_SECONDS, "300-599": 0 } }, // only cache successes
      });
      if (!res.ok) {
        attempts.push(`${res.status} from ${feedUrl}`);
        continue;
      }

      const videos = parseFeed(await res.text());
      if (videos.length === 0) {
        attempts.push(`no videos in ${feedUrl}`);
        continue;
      }

      const body = JSON.stringify({ videos });
      // Save a backup copy for when YouTube is down.
      waitUntil(
        cache.put(backupKey, new Response(body, {
          headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${BACKUP_SECONDS}` },
        }))
      );
      return respond(body, 200, `public, max-age=${CACHE_SECONDS}`, "youtube");
    } catch (err) {
      attempts.push(`${err?.message || err} (${feedUrl})`);
    }
  }

  // YouTube failed: serve the last good list if we have one.
  const backup = await cache.match(backupKey);
  if (backup) {
    return respond(await backup.text(), 200, "public, max-age=300", "backup");
  }

  return respond(JSON.stringify({ videos: [], error: "YouTube feed unavailable", attempts }), 502, "no-store", "none");
}

function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .slice(0, COUNT)
    .map(([, entry]) => ({
      id: pick(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/),
      title: decodeEntities(pick(entry, /<title>([^<]*)<\/title>/)),
      published: pick(entry, /<published>([^<]+)<\/published>/),
    }))
    .filter((video) => video.id);
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

function respond(body, status, cacheControl, source) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
      "X-Videos-Source": source, // youtube | backup | none — handy for debugging
    },
  });
}
