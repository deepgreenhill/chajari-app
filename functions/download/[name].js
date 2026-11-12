// /download/<파일 이름> → GitHub Release의 최신 설치 파일을 그대로 이어서 내려준다.
// 내려받는 사람에게는 chajari.pages.dev 주소만 보인다. (Cloudflare Pages Functions, 무료 하루 10만 회)
const FILES = new Set(['chajari-win-x64.exe', 'chajari-mac-arm64.dmg', 'chajari-mac-x64.dmg']);
export async function onRequest({ params, request }) {
  const name = String(params.name || '');
  if (!FILES.has(name)) return new Response('없는 파일이에요', { status: 404 });
  const src = await fetch(`https://github.com/deepgreenhill/chajari-app/releases/latest/download/${name}`, {
    method: request.method === 'HEAD' ? 'HEAD' : 'GET', redirect: 'follow',
  });
  if (!src.ok) return new Response('잠시 후 다시 시도해 주세요', { status: 502 });
  const h = new Headers({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${name}"`,
    'Cache-Control': 'no-store',
  });
  const len = src.headers.get('Content-Length'); if (len) h.set('Content-Length', len);
  return new Response(src.body, { status: 200, headers: h });
}
