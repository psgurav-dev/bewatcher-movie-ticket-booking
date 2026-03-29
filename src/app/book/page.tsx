'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { MapPin, Sparkles, Volume2, Armchair } from 'lucide-react';

import {
	MOCK_CITIES,
	type ShowAvailability,
	type Theatre,
	formatDateLabel,
	toISODate,
} from '@/data/mockTheatres';

function addDays(base: Date, n: number): Date {
	const d = new Date(base);
	d.setDate(d.getDate() + n);
	return d;
}

function availabilityStyles(a: ShowAvailability): {
	label: string;
	className: string;
} {
	switch (a) {
		case 'available':
			return {
				label: 'Available',
				className:
					'border-emerald-500/45 text-emerald-200/95 hover:bg-emerald-500/10 hover:border-emerald-400/60',
			};
		case 'filling_fast':
			return {
				label: 'Filling fast',
				className:
					'border-amber-400/55 text-amber-200/95 hover:bg-amber-500/10 hover:border-amber-300/65',
			};
		case 'sold_out':
			return {
				label: 'Sold out',
				className: 'border-white/10 text-white/25 cursor-not-allowed opacity-50',
			};
	}
}

const containerVariants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring' as const, stiffness: 260, damping: 26 },
	},
};

export default function BookPage() {
	const router = useRouter();
	const [cityId, setCityId] = useState(MOCK_CITIES[0]?.id ?? 'mumbai');
	const [pickDate, setPickDate] = useState(() => new Date());
	const [dolbyOnly, setDolbyOnly] = useState(false);

	const city = useMemo(
		() => MOCK_CITIES.find((c) => c.id === cityId) ?? MOCK_CITIES[0],
		[cityId]
	);

	const dateStrip = useMemo(() => {
		const start = new Date();
		start.setHours(12, 0, 0, 0);
		return Array.from({ length: 8 }, (_, i) => addDays(start, i));
	}, []);

	const theatres = useMemo(() => {
		let list = city?.theatres ?? [];
		if (dolbyOnly) {
			list = list.filter((t) =>
				t.amenities.some((a) => a.toLowerCase().includes('dolby'))
			);
		}
		return [...list].sort((a, b) => a.distanceKm - b.distanceKm);
	}, [city?.theatres, dolbyOnly]);

	const dateISO = toISODate(pickDate);
	const isToday =
		toISODate(new Date()) === dateISO;

	const goToSeats = (theatre: Theatre, time: string) => {
		const q = new URLSearchParams({
			city: cityId,
			theatreId: theatre.id,
			time,
			date: dateISO,
		});
		router.push(`/book/seats?${q.toString()}`);
	};

	return (
		<>
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute inset-0 bg-[#09090f]" />
				<div
					className="absolute -top-[10%] left-[20%] w-[80vw] h-[70vh]"
					style={{
						background:
							'radial-gradient(ellipse at center, rgba(180,30,60,0.14) 0%, transparent 68%)',
					}}
				/>
				<div
					className="absolute bottom-[-10%] right-[-4%] w-[55vw] h-[55vh]"
					style={{
						background:
							'radial-gradient(ellipse at center, rgba(30,60,200,0.12) 0%, transparent 70%)',
					}}
				/>
				</div>

			<main
				className="relative min-h-screen w-full pb-20"
				style={{
					fontFamily: 'var(--font-bricolage), system-ui, sans-serif',
					color: 'rgb(244,244,245)',
				}}
			>
				<div className="max-w-3xl mx-auto px-5 md:px-8 pt-10 md:pt-14">
					<motion.header
						className="mb-10"
						initial={{ opacity: 0, y: -12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.45, ease: 'easeOut' }}
					>
						<p className="text-[10px] uppercase tracking-[0.32em] text-white/30 mb-3 flex items-center gap-2">
							<Sparkles className="w-3.5 h-3.5 text-amber-400/60" />
							Quick book
						</p>
						<h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
							Choose cinema &amp; show
						</h1>
						<p className="mt-3 text-white/45 text-sm leading-relaxed max-w-xl">
							Pick a city, date, and showtime—then select your seats in the audi,
							just like a mainstream tickets app.
						</p>
						<Link
							href="/movies"
							className="inline-block mt-4 text-xs uppercase tracking-[0.2em] text-amber-400/85 hover:text-amber-300"
						>
							← Back to movies
						</Link>
					</motion.header>

					<section className="mb-8">
						<h2 className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-3">
							City
						</h2>
						<div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
							{MOCK_CITIES.map((c) => (
								<button
									key={c.id}
									type="button"
									onClick={() => setCityId(c.id)}
									className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
										cityId === c.id
											? 'border-amber-400/60 bg-amber-500/15 text-amber-100'
											: 'border-white/10 text-white/55 hover:border-white/20 hover:text-white/75'
									}`}
								>
									{c.name}
								</button>
							))}
						</div>
					</section>

					<section className="mb-8">
						<div className="flex items-end justify-between gap-4 mb-3">
							<h2 className="text-[10px] uppercase tracking-[0.28em] text-white/35">
								Date
							</h2>
							<button
								type="button"
								onClick={() => setDolbyOnly((v) => !v)}
								className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-lg border transition-colors ${
									dolbyOnly
										? 'border-sky-400/45 text-sky-200 bg-sky-500/10'
										: 'border-white/10 text-white/40 hover:border-white/18'
								}`}
							>
								<Volume2 className="w-3.5 h-3.5" />
								Dolby only
							</button>
						</div>
						<div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
							{dateStrip.map((d) => {
								const iso = toISODate(d);
								const active = iso === dateISO;
								const today = toISODate(new Date()) === iso;
								return (
									<button
										key={iso}
										type="button"
										onClick={() => setPickDate(d)}
										className={`shrink-0 min-w-[4.5rem] py-2.5 px-3 rounded-xl border text-left transition-colors ${
											active
												? 'border-amber-400/55 bg-amber-500/10'
												: 'border-white/10 hover:border-white/18 bg-white/[0.02]'
										}`}
									>
										<span className="block text-[9px] uppercase tracking-wider text-white/35">
											{today ? 'Today' : formatDateLabel(d).split(' ')[0]}
										</span>
										<span className="block text-sm font-bold text-white/90 mt-0.5">
											{d.getDate()} {d.toLocaleDateString('en-IN', { month: 'short' })}
										</span>
									</button>
								);
							})}
						</div>
					</section>

					<section>
						<h2 className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-4">
							Theatres in {city.name}
							{isToday ? '' : ` · ${formatDateLabel(pickDate)}`}
						</h2>

						{theatres.length === 0 ? (
							<p className="text-white/35 text-sm py-12 text-center border border-dashed border-white/10 rounded-2xl">
								No theatres match this filter. Try turning off Dolby only.
							</p>
						) : (
							<motion.ul
								className="flex flex-col gap-5"
								variants={containerVariants}
								initial="hidden"
								animate="show"
							>
								{theatres.map((theatre) => (
									<motion.li
										key={theatre.id}
										variants={cardVariants}
										className="rounded-2xl border border-white/[0.09] bg-white/[0.03] p-5 md:p-6"
										style={{
											boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
										}}
									>
										<div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 mb-4">
											<div className="flex-1 min-w-0">
												<p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/70 mb-1">
													{theatre.chain}
												</p>
												<h3 className="text-lg font-bold text-white/95 leading-snug">
													{theatre.name}
												</h3>
												<p className="text-xs text-white/40 mt-1.5 flex items-center gap-1.5 flex-wrap">
													<MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
													{theatre.area}
													<span className="text-white/25">·</span>
													<span>{theatre.distanceKm} km</span>
													<span className="text-white/25">·</span>
													<span>{theatre.screenLabel}</span>
												</p>
												<div className="flex flex-wrap gap-1.5 mt-3">
													{theatre.amenities.map((a) => (
														<span
															key={a}
															className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-white/50 border border-white/[0.06]"
														>
															{a}
														</span>
													))}
												</div>
											</div>
										</div>

										<div>
											<p className="text-[10px] uppercase tracking-[0.24em] text-white/30 mb-2 flex items-center gap-2">
												<Armchair className="w-3.5 h-3.5" />
												Showtimes
											</p>
											<div className="flex flex-wrap gap-2">
												{theatre.shows.map((s) => {
													const st = availabilityStyles(s.availability);
													const disabled = s.availability === 'sold_out';
													return (
														<button
															key={s.time}
															type="button"
															disabled={disabled}
															title={st.label}
															onClick={() => !disabled && goToSeats(theatre, s.time)}
															className={`min-w-[4.75rem] px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${st.className}`}
														>
															{s.time}
														</button>
													);
												})}
											</div>
										</div>
									</motion.li>
								))}
							</motion.ul>
						)}
					</section>
				</div>
			</main>
		</>
	);
}
