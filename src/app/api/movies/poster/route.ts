import { NextRequest, NextResponse } from 'next/server';

const TMDB_IMG = 'https://image.tmdb.org/t/p';
const ALLOWED = new Set(['w342', 'w500', 'w780']);

function isSafePath(path: string | null): path is string {
	if (!path || path.length > 220) return false;
	if (!path.startsWith('/')) return false;
	if (path.includes('..')) return false;
	return /^\/[a-zA-Z0-9_.~-]+$/.test(path);
}

/** Same-origin poster bytes for client-side palette extraction (avoids TMDB canvas CORS). */
export async function GET(req: NextRequest) {
	const path = req.nextUrl.searchParams.get('path');
	const size = req.nextUrl.searchParams.get('size') || 'w500';
	if (!ALLOWED.has(size)) {
		return NextResponse.json({ error: 'Invalid size' }, { status: 400 });
	}
	if (!isSafePath(path)) {
		return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
	}

	const url = `${TMDB_IMG}/${size}${path}`;
	try {
		const res = await fetch(url, { next: { revalidate: 86_400 } });
		if (!res.ok) {
			return NextResponse.json(
				{ error: 'Image not found' },
				{ status: res.status === 404 ? 404 : 502 }
			);
		}
		const buf = await res.arrayBuffer();
		const type = res.headers.get('content-type') || 'image/jpeg';
		return new NextResponse(buf, {
			status: 200,
			headers: {
				'Content-Type': type,
				'Cache-Control': 'public, max-age=86400, s-maxage=86400',
			},
		});
	} catch (e) {
		console.error('Poster proxy:', e);
		return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
	}
}
