import { NextRequest, NextResponse } from "next/server";
// import redis from "@/config/redis";

/** TMDB responses must not sit in Next.js Data Cache or edge caches, or "today's window" stays stale. */
export const dynamic = "force-dynamic";

const formatDate = (date: Date) => date.toISOString().split("T")[0];

export async function GET(request: NextRequest) {
	try {
        const todayDate = new Date();
        const fifteenDaysAgoDate = new Date(todayDate);
        fifteenDaysAgoDate.setDate(fifteenDaysAgoDate.getDate() - 30);

        const today = formatDate(todayDate);
        const fifteenDaysAgo = formatDate(fifteenDaysAgoDate);

        const cacheKey = `movies_${fifteenDaysAgo}_${today}`;

        // const cachedData = await redis.get(cacheKey);
        // if (cachedData) {
        //     return NextResponse.json(JSON.parse(cachedData), { status: 200 });
        // }

        const movieDbUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_release_type=2%7C3&release_date.gte=${fifteenDaysAgo}&release_date.lte=${today}&api_key=${process
            .env.MOVIE_DB_API_KEY!}&with_origin_country=IN`;

        const response = await fetch(movieDbUrl, {
            method: "GET",
            cache: "no-store",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${process.env.MOVIE_DB_API_KEY!}`,
            },
        });
        console.log(response);

        if (!response.ok) {
            throw new Error('Failed to fetch data from TMDB API');
        }
        const jsonData = await response.json();

        // await redis.set(cacheKey, JSON.stringify(jsonData), 'EX', 21600);

        return NextResponse.json(jsonData, {
            status: 200,
            headers: {
                "Cache-Control": "private, no-store, must-revalidate",
            },
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
