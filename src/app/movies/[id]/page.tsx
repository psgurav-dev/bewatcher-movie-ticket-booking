'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from "motion/react";
import { extractPalette, getContrastColor } from '@/utils/colors';

const TMDB_IMG = 'https://image.tmdb.org/t/p';

interface Genre {
	id: number;
	name: string;
}

interface CreditPerson {
	id: number;
	name: string;
	job?: string;
	character?: string;
	profile_path: string | null;
}

interface Credits {
	cast: CreditPerson[];
	crew: CreditPerson[];
}

interface VideoResult {
	key: string;
	site: string;
	type: string;
	official?: boolean;
}

interface Videos {
	results: VideoResult[];
}

interface MovieDetail {
	id: number;
	title: string;
	original_title: string;
	tagline: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	release_date: string;
	runtime: number | null;
	vote_average: number;
	vote_count: number;
	status: string;
	budget: number;
	revenue: number;
	popularity: number;
	original_language: string;
	spoken_languages: { english_name: string; name: string }[];
	production_countries: { name: string; iso_3166_1: string }[];
	production_companies: { name: string; logo_path: string | null }[];
	genres: Genre[];
	homepage: string;
	imdb_id: string | null;
	credits?: Credits;
	videos?: Videos;
}

const FALLBACK_PALETTE = [
	'rgb(180, 30, 60)',
	'rgb(30, 60, 200)',
	'rgb(200, 120, 20)',
	'rgb(100, 40, 180)',
];

const DEFAULT_THEME = {
	bg: 'rgb(9, 9, 11)',
	text: 'rgb(244, 244, 245)',
	accent: 'rgb(249, 115, 22)',
	muted: 'rgba(255, 255, 255, 0.12)',
};

type ThemeColors = typeof DEFAULT_THEME;

function buildThemeFromPalette(colors: string[]): ThemeColors {
	const bg = colors[0];
	const accent = colors[1] || colors[0];
	const text = getContrastColor(bg);
	return {
		bg,
		accent,
		text,
		muted:
			text === '#ffffff'
				? 'rgba(255, 255, 255, 0.14)'
				: 'rgba(0, 0, 0, 0.12)',
	};
}

function rgbToRgba(rgb: string, alpha: number): string {
	const m = rgb.match(/\d+/g);
	if (!m || m.length < 3) return `rgba(9, 9, 15, ${alpha})`;
	return `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${alpha})`;
}

function formatMoney(n: number): string {
	if (!n) return '—';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		notation: n >= 10_000_000 ? 'compact' : 'standard',
		maximumFractionDigits: n >= 10_000_000 ? 1 : 0,
	}).format(n);
}

function formatRuntime(minutes: number | null): string {
	if (!minutes) return '—';
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h === 0) return `${m} min`;
	return `${h}h ${m}m`;
}

function pickYoutubeTrailer(videos: Videos | undefined): string | null {
	if (!videos?.results?.length) return null;
	const preferred =
		videos.results.find(
			(v) =>
				v.site === 'YouTube' &&
				(v.type === 'Trailer' || v.type === 'Teaser')
		) || videos.results.find((v) => v.site === 'YouTube');
	return preferred?.key ?? null;
}

export default function MovieDetailPage() {
	const params = useParams();
	const id = params?.id as string | undefined;

	const [movie, setMovie] = useState<MovieDetail | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [palette, setPalette] = useState<string[]>([]);
	const [themeColors, setThemeColors] = useState<ThemeColors>(DEFAULT_THEME);

	useEffect(() => {
		if (!id) {
			setLoading(false);
			setError('Missing movie id');
			return;
		}

		let cancelled = false;
		(async () => {
			setLoading(true);
			setError(null);
			setThemeColors(DEFAULT_THEME);
			setPalette([]);
			try {
				const res = await fetch(`/api/movies/details?id=${id}`);
				if (!res.ok) {
					if (res.status === 404) setError('Movie not found');
					else setError('Could not load movie');
					setMovie(null);
					return;
				}
				const data: MovieDetail = await res.json();
				if (cancelled) return;
				setMovie(data);

				if (data.poster_path) {
					// Same-origin proxy — TMDB remote URLs taint canvas / block getImageData
					const paletteSrc = `/api/movies/poster?size=w500&path=${encodeURIComponent(data.poster_path)}`;
					try {
						const colors = await extractPalette(paletteSrc);
						if (cancelled) return;
						setPalette(colors);
						if (colors.length > 0) {
							setThemeColors(buildThemeFromPalette(colors));
						}
					} catch (e) {
						console.error('Failed to extract palette', e);
						if (!cancelled) {
							setPalette(FALLBACK_PALETTE);
							setThemeColors(buildThemeFromPalette(FALLBACK_PALETTE));
						}
					}
				} else {
					setThemeColors(DEFAULT_THEME);
				}
			} catch {
				if (!cancelled) {
					setError('Could not load movie');
					setMovie(null);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [id]);

	const accent2 = palette[1] || palette[0] || themeColors.accent;
	const btnGradient = `linear-gradient(125deg, ${themeColors.accent} 0%, ${accent2} 100%)`;

	const directors = useMemo(() => {
		const crew = movie?.credits?.crew ?? [];
		return crew.filter((c) => c.job === 'Director').slice(0, 4);
	}, [movie?.credits?.crew]);

	const cast = useMemo(() => {
		return (movie?.credits?.cast ?? []).slice(0, 16);
	}, [movie?.credits?.cast]);

	const trailerKey = useMemo(
		() => pickYoutubeTrailer(movie?.videos),
		[movie?.videos]
	);

	if (loading) {
		return (
			<div
				className="min-h-[70vh] flex flex-col items-center justify-center gap-4 transition-colors duration-500"
				style={{
					fontFamily: "'Sora', sans-serif",
					backgroundColor: themeColors.bg,
					color: themeColors.text,
				}}
			>
				<div
					className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
					style={{
						borderColor: `${themeColors.accent} transparent transparent transparent`,
					}}
				/>
				<p className="opacity-50 text-sm">Loading picture…</p>
			</div>
		);
	}

	if (error || !movie) {
		return (
			<div
				className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 transition-colors duration-500"
				style={{
					fontFamily: "'Sora', sans-serif",
					backgroundColor: themeColors.bg,
					color: themeColors.text,
				}}
			>
				<p className="opacity-80 text-lg">{error ?? 'Something went wrong'}</p>
				<Link
					href="/movies"
					className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
					style={{
						background: themeColors.accent,
						color: getContrastColor(themeColors.accent),
					}}
				>
					Back to movies
				</Link>
			</div>
		);
	}

	const year = movie.release_date?.slice(0, 4) ?? '';
	const backdropUrl = movie.backdrop_path
		? `${TMDB_IMG}/w1280${movie.backdrop_path}`
		: null;
	const posterUrl = movie.poster_path
		? `${TMDB_IMG}/w500${movie.poster_path}`
		: null;

	return (
		<div
			className="relative min-h-screen w-full overflow-x-hidden pb-24 transition-colors duration-1000"
			style={{
				fontFamily: "'Sora', sans-serif",
				backgroundColor: themeColors.bg,
				color: themeColors.text,
			}}
		>
			{backdropUrl && (
				<div className="fixed inset-0 -z-10 pointer-events-none">
					<img
						src={backdropUrl}
						alt=""
						referrerPolicy="no-referrer"
						className="w-full h-full object-cover opacity-40 scale-105 blur-sm"
					/>
					<div
						className="absolute inset-0"
						style={{
							backgroundImage: `linear-gradient(to top, ${themeColors.bg}, transparent)`,
						}}
					/>
				</div>
			)}

			<div className="relative max-w-[1200px] mx-auto px-5 md:px-10 lg:px-12 pt-6">
				<motion.nav
					initial={{ opacity: 0, y: -8 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center gap-3 mb-10"
				>
					<Link
						href="/movies"
						className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50 hover:opacity-90 transition-opacity"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Now Showing
					</Link>
				</motion.nav>

				<header className="grid grid-cols-1 lg:grid-cols-[minmax(220px,280px)_1fr] gap-10 lg:gap-14 items-start">
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mx-auto lg:mx-0 w-full max-w-[280px]"
					>
						<div
							className="relative rounded-2xl overflow-hidden shadow-2xl border"
							style={{
								boxShadow: `0 24px 80px ${rgbToRgba(themeColors.accent, 0.35)}`,
								borderColor: themeColors.muted,
							}}
						>
							{posterUrl ? (
								<img
									src={posterUrl}
									alt={movie.title}
									referrerPolicy="no-referrer"
									className="w-full aspect-[2/3] object-cover"
								/>
							) : (
								<div
									className="aspect-[2/3] flex items-center justify-center opacity-40 text-sm"
									style={{ background: themeColors.muted }}
								>
									No poster
								</div>
							)}
							<div
								className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
								style={{
									background: `linear-gradient(to top, ${rgbToRgba(palette[0] ?? themeColors.bg, 0.65)}, transparent)`,
								}}
							/>
						</div>

						<div className="mt-5 flex flex-wrap gap-2">
							{movie.genres.map((g) => (
								<span
									key={g.id}
									className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
									style={{
										backgroundColor: themeColors.muted,
									}}
								>
									{g.name}
								</span>
							))}
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.08 }}
						className="space-y-6"
					>
						{movie.tagline && (
							<p
								className="text-[12px] md:text-sm italic opacity-60 tracking-wide border-l-2 pl-4"
								style={{ borderColor: themeColors.accent }}
							>
								{movie.tagline}
							</p>
						)}
						<div>
							<h1 className="text-3xl md:text-5xl font-extrabold leading-[1.08] tracking-[-0.02em]">
								{movie.title || movie.original_title}
							</h1>
							{movie.original_title !== movie.title && (
								<p className="mt-2 opacity-50 text-sm">
									{(movie.original_language || '').toUpperCase()}
									{movie.original_language ? ' · ' : ''}
									{movie.original_title}
								</p>
							)}	
						</div>

						<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] opacity-80 font-medium">
							{year && (
								<span className="font-mono tabular-nums">{year}</span>
							)}
							<span className="font-mono">{formatRuntime(movie.runtime)}</span>
							<span className="flex items-center gap-1.5">
								<svg
									className="w-4 h-4"
									style={{ color: themeColors.accent }}
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								<span className="font-mono font-semibold">
									{movie.vote_average.toFixed(1)}
								</span>
								<span className="opacity-50">
									({movie.vote_count.toLocaleString()} votes)
								</span>
							</span>
							<span className="uppercase text-[10px] tracking-widest opacity-40">
								{movie.status}
							</span>
						</div>

						{directors.length > 0 && (
							<div className="text-sm">
								<span className="opacity-40 uppercase text-[10px] tracking-[0.2em] block mb-1">
									Directed by
								</span>
								<span className="opacity-90 font-medium">
									{directors.map((d) => d.name).join(' · ')}
								</span>
							</div>
						)}

						<div className="flex flex-wrap gap-3">
							<Link
								href={`/movies`}
								className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold tracking-wide shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
								style={{
									background: btnGradient,
									color: getContrastColor(themeColors.accent),
									boxShadow: `0 12px 40px ${rgbToRgba(themeColors.accent, 0.35)}`,
								}}
							>
								Book tickets
							</Link>
							{movie.homepage && (
								<a
									href={movie.homepage}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold border transition-colors hover:opacity-90"
									style={{
										borderColor: themeColors.muted,
									}}
								>
									Official site
								</a>
							)}
							{movie.imdb_id && (
								<a
									href={`https://www.imdb.com/title/${movie.imdb_id}`}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold border transition-colors hover:opacity-90"
									style={{
										borderColor: themeColors.muted,
										opacity: 0.9,
									}}
								>
									IMDb
								</a>
							)}
						</div>
					</motion.div>
				</header>

				<motion.section
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mt-14 md:mt-20 p-6 md:p-8 rounded-2xl border backdrop-blur-md"
					style={{
						backgroundColor: themeColors.muted,
						borderColor: themeColors.muted,
					}}
				>
					<h2 className="text-[10px] uppercase tracking-[0.28em] opacity-40 mb-4">
						Synopsis
					</h2>
					<p className="opacity-80 text-[15px] md:text-base leading-relaxed max-w-3xl">
						{movie.overview || 'No overview available.'}
					</p>
				</motion.section>

				<section className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					{[
						{ label: 'Release', value: movie.release_date || '—' },
						{ label: 'Runtime', value: formatRuntime(movie.runtime) },
						{ label: 'Popularity', value: movie.popularity?.toFixed(1) ?? '—' },
						{ label: 'Original language', value: movie.original_language?.toUpperCase() ?? '—' },
						{ label: 'Budget', value: formatMoney(movie.budget) },
						{ label: 'Revenue', value: formatMoney(movie.revenue) },
					].map((item) => (
						<motion.div
							key={item.label}
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="rounded-xl p-4 border"
							style={{
								backgroundColor: themeColors.muted,
								borderColor: themeColors.muted,
							}}
						>
							<p className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-1">
								{item.label}
							</p>
							<p className="opacity-95 text-sm font-semibold">{item.value}</p>
						</motion.div>
					))}
				</section>

				{movie.spoken_languages.length > 0 && (
					<section className="mt-10">
						<h2 className="text-[10px] uppercase tracking-[0.28em] opacity-40 mb-3">
							Languages
						</h2>
						<div className="flex flex-wrap gap-2">
							{movie.spoken_languages.map((lang) => (
								<span
									key={lang.english_name}
									className="px-3 py-1.5 rounded-lg text-xs opacity-70 border"
									style={{ borderColor: themeColors.muted }}
								>
									{lang.english_name || lang.name}
								</span>
							))}
						</div>
					</section>
				)}

				{movie.production_countries.length > 0 && (
					<section className="mt-8">
						<h2 className="text-[10px] uppercase tracking-[0.28em] opacity-40 mb-3">
							Countries
						</h2>
						<p className="opacity-70 text-sm">
							{movie.production_countries.map((c) => c.name).join(' · ')}
						</p>
					</section>
				)}

				{movie.production_companies.length > 0 && (
					<section className="mt-8">
						<h2 className="text-[10px] uppercase tracking-[0.28em] opacity-40 mb-4">
							Production
						</h2>
						<ul className="flex flex-col gap-2 opacity-70 text-sm">
							{movie.production_companies.map((co) => (
								<li key={co.name} className="flex items-center gap-2">
									<span
										className="w-1.5 h-1.5 rounded-full shrink-0"
										style={{ background: themeColors.accent }}
									/>
									{co.name}
								</li>
							))}
						</ul>
					</section>
				)}

				{trailerKey && (
					<section className="mt-14">
						<h2 className="text-[10px] uppercase tracking-[0.28em] opacity-40 mb-4">
							Trailer
						</h2>
						<div
							className="relative aspect-video w-full max-w-3xl rounded-xl overflow-hidden border"
							style={{
								borderColor: themeColors.muted,
								boxShadow: `0 20px 60px ${rgbToRgba(accent2, 0.25)}`,
							}}
						>
							<iframe
								title="Trailer"
								src={`https://www.youtube.com/embed/${trailerKey}`}
								className="absolute inset-0 w-full h-full"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
					</section>
				)}

				{cast.length > 0 && (
					<section className="mt-14">
						<h2 className="text-[10px] uppercase tracking-[0.28em] opacity-40 mb-5">
							Cast
						</h2>
						<div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-thin">
							{cast.map((person) => (
								<div
									key={`${person.id}-${person.character}`}
									className="shrink-0 w-[120px] md:w-[132px]"
								>
									<div
										className="rounded-xl overflow-hidden aspect-[2/3] mb-2 border"
										style={{
											borderColor: themeColors.muted,
											backgroundColor: themeColors.muted,
										}}
									>
										{person.profile_path ? (
											<img
												src={`${TMDB_IMG}/w185${person.profile_path}`}
												alt={person.name}
												referrerPolicy="no-referrer"
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center opacity-30 text-[10px] text-center p-2">
												No photo
											</div>
										)}
									</div>
									<p className="opacity-95 text-xs font-semibold leading-snug line-clamp-2">
										{person.name}
									</p>
									{person.character && (
										<p className="opacity-40 text-[10px] mt-0.5 line-clamp-2">
											{person.character}
										</p>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				{/* Palette strip — ties theme to the poster */}
				<section className="mt-16 flex flex-wrap items-center gap-3">
					<span className="text-[9px] uppercase tracking-[0.2em] opacity-40">
						Poster palette
					</span>
					<div
						className="flex rounded-full overflow-hidden border h-6"
						style={{ borderColor: themeColors.muted }}
					>
						{(palette.length > 0 ? palette : FALLBACK_PALETTE)
							.slice(0, 6)
							.map((c, i) => (
								<div key={i} className="w-8 h-full" style={{ background: c }} title={c} />
							))}
					</div>
				</section>
			</div>
		</div>
	);
}
