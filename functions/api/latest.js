// /api/latest → 최신 버전 이름·날짜·파일 크기 (페이지 아래 '버전' 표시용). 10분 캐시.
export async function onRequest({ request, waitUntil }) {
  const cache = caches.default, key = new Request(new URL(request.url).origin + '/api/latest');
  const hit = await cache.match(key); if (hit) return hit;
  const r = await fetch('https://api.github.com/repos/deepgreenhill/chajari-app/releases/latest', {
    headers: { 'User-Agent': 'chajari-site', Accept: 'application/vnd.github+json' },
  });
  if (!r.ok) return new Response('{}', { status: 502, headers: { 'Content-Type': 'application/json' } });
  const j = await r.json();
  const body = JSON.stringify({ tag: j.tag_name, date: j.published_at, sizes: Object.fromEntries((j.assets || []).map(a => [a.name, a.size])) });
  const res = new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
  waitUntil(cache.put(key, res.clone()));
  return res;
}
