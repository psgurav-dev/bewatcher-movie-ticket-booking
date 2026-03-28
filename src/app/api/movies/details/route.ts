import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id || !/^\d+$/.test(id)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    try {
        const url = new URL(`https://api.themoviedb.org/3/movie/${id}`);
        url.searchParams.append('api_key', process.env.MOVIE_DB_API_KEY!);
        url.searchParams.append('language', 'en-US');
        url.searchParams.append(
            'append_to_response',
            'videos,credits,recommendations'
        );
        const response = await fetch(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.MOVIE_DB_API_KEY!}`,
            },
            next: { revalidate: 3600 },
        });
        if (response.status === 404) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if (!response.ok) {
            throw new Error('TMDB request failed');
        }
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error('Movie detail error:', e);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
