'use client';

import React, { Suspense, useContext, useEffect, useMemo, useCallback, MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { motion } from 'motion/react';
import { ArrowLeft, Armchair, Sparkles } from 'lucide-react';

import SeatMap, { seatPrice } from '@/components/booking/SeatMap';
import { BookingContx, BookingVenue } from '@/context/BookingContext';
import { findCity, findTheatre, formatDateLabel } from '@/data/mockTheatres';

function loadGenerateQRCode() {
	if (typeof window === 'undefined') return Promise.resolve(null);
	return import('@/utils/GenerateQRCode').then((m) => m.generateQRCode);
}

function BookSeatsInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const cityId = searchParams.get('city') ?? '';
	const theatreId = searchParams.get('theatreId') ?? '';
	const time = searchParams.get('time') ?? '';
	const dateISO = searchParams.get('date') ?? '';
	const movieTitle = searchParams.get('movie')?.trim() || null;

	const {
		selectedSeats,
		bookedSeats,
		handleSeatClick,
		handleClear,
		clearSeatSelection,
		syncBookingSession,
	} = useContext(BookingContx);

	const theatre = useMemo(
		() => (cityId && theatreId ? findTheatre(cityId, theatreId) : undefined),
		[cityId, theatreId]
	);

	const venue: BookingVenue | null = useMemo(() => {
		if (!theatre || !cityId) return null;
		const c = findCity(cityId);
		if (!c) return null;
		return {
			cityId,
			cityName: c.name,
			theatreId: theatre.id,
			theatreName: theatre.name,
			screenLabel: theatre.screenLabel,
		};
	}, [cityId, theatre]);

	useEffect(() => {
		if (!time || !dateISO || !theatre || !venue) return;
		syncBookingSession({
			showTime: time,
			showDate: dateISO,
			venue,
			movieTitle: movieTitle || 'Your show',
		});
	}, [time, dateISO, theatre, venue, movieTitle, syncBookingSession]);

	useEffect(() => {
		clearSeatSelection();
	}, [cityId, theatreId, time, dateISO, clearSeatSelection]);

	const locked = useMemo(
		() => Array.from(new Set(bookedSeats)),
		[bookedSeats]
	);

	const total = useMemo(
		() => selectedSeats.reduce((s, id) => s + seatPrice(id), 0),
		[selectedSeats]
	);

	const handlePayNow = useCallback(
		async (e: MouseEvent<HTMLButtonElement>) => {
			e.preventDefault();
			const gen = await loadGenerateQRCode();
			if (!gen) return;
			try {
				const emailContent = await gen('Hello user');
				await axios.post('/api/send-email', { qrcode: emailContent });
			} catch (error) {
				console.error('Error sending email:', error);
			}
			router.push('/payment');
		},
		[router]
	);

	const invalid = !cityId || !theatreId || !time || !dateISO || !theatre;

	if (invalid) {
		return (
			<div
				className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center"
				style={{
					fontFamily: 'var(--font-bricolage), system-ui, sans-serif',
					background: '#09090f',
					color: 'rgb(244,244,245)',
				}}
			>
				<p className="text-white/50 text-sm">Missing booking details.</p>
				<Link
					href="/book"
					className="text-amber-400 hover:text-amber-300 text-sm font-semibold"
				>
					← Back to cinemas
				</Link>
			</div>
		);
	}

	const dateObj = new Date(dateISO + 'T12:00:00');

	return (
		<div
			className="min-h-screen pb-36"
			style={{
				fontFamily: 'var(--font-bricolage), system-ui, sans-serif',
				background: '#09090f',
				color: 'rgb(244,244,245)',
			}}
		>
			<div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
				<div className="absolute inset-0 bg-[#09090f]" />
				<div
					className="absolute -top-32 left-1/4 w-[90vw] h-[70vh] opacity-30"
					style={{
						background:
							'radial-gradient(ellipse at center, rgba(180,30,60,0.2) 0%, transparent 70%)',
					}}
				/>
				<div
					className="absolute bottom-0 right-0 w-[70vw] h-[50vh] opacity-25"
					style={{
						background:
							'radial-gradient(ellipse at center, rgba(30,60,200,0.15) 0%, transparent 70%)',
					}}
				/>
			</div>

			<div className="max-w-4xl mx-auto px-5 md:px-8 pt-8">
				<Link
					href="/book"
					className="inline-flex items-center gap-2 text-white/45 hover:text-white/75 text-xs uppercase tracking-[0.2em] mb-8"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					Cinemas
				</Link>

				<header className="mb-8 space-y-2">
					<p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
						{venue?.cityName} · {theatre.chain}
					</p>
					<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white/95">
						{theatre.name}
					</h1>
					<p className="text-sm text-white/50 flex flex-wrap gap-x-3 gap-y-1 items-center">
						<span>{theatre.screenLabel}</span>
						<span className="text-white/20">·</span>
						<span>{formatDateLabel(dateObj)}</span>
						<span className="text-white/20">·</span>
						<span className="text-amber-300/90 font-medium">{time}</span>
						{movieTitle && (
							<>
								<span className="text-white/20">·</span>
								<span className="text-white/60">{movieTitle}</span>
							</>
						)}
					</p>
				</header>

				<div
					className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-6 md:px-8 md:py-8 mb-8"
					style={{
						boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
					}}
				>
					<div className="text-center mb-2">
						<p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-3">
							Screen this way
						</p>
						<div
							className="h-2 md:h-3 w-[88%] max-w-xl mx-auto rounded-t-full border-t-2 border-x border-amber-400/40 bg-gradient-to-b from-amber-500/15 to-transparent"
							aria-hidden
						/>
					</div>

					<SeatMap
						selectedSeats={selectedSeats}
						lockedSeats={locked}
						handleSeatClick={handleSeatClick}
					/>

					<div className="mt-8 flex flex-wrap justify-center gap-4 text-[11px] text-white/45">
						<span className="inline-flex items-center gap-1.5">
							<Armchair className="w-3.5 h-3.5 text-emerald-400/90" /> Economy
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Armchair className="w-3.5 h-3.5 text-amber-400/90" /> Classic
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Armchair className="w-3.5 h-3.5 text-fuchsia-400/90" /> Prime
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Armchair className="w-3.5 h-3.5 text-sky-400" /> Selected
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Armchair className="w-3.5 h-3.5 text-red-500/80" /> Sold
						</span>
					</div>
				</div>
			</div>

			<motion.div
				className="fixed bottom-0 inset-x-0 z-40 border-t border-white/[0.08] px-4 py-4 md:py-5 backdrop-blur-xl"
				style={{ background: 'rgba(9,9,15,0.92)' }}
				initial={{ y: 48, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ type: 'spring', stiffness: 280, damping: 32 }}
			>
				<div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
					<div className="flex-1 min-w-0">
						<p className="text-[10px] uppercase tracking-[0.24em] text-white/35 mb-1">
							Your seats
						</p>
						{selectedSeats.length === 0 ? (
							<p className="text-sm text-white/40 flex items-center gap-2">
								<Sparkles className="w-4 h-4 text-amber-400/50 shrink-0" />
								Tap seats on the audi layout
							</p>
						) : (
							<p className="text-sm text-white/90 font-medium truncate">
								{[...selectedSeats].sort().join(', ')}
							</p>
						)}
					</div>
					<div className="flex items-center gap-3 shrink-0">
						{selectedSeats.length > 0 && (
							<button
								type="button"
								onClick={handleClear}
								className="px-4 py-2.5 rounded-xl border border-white/15 text-white/60 text-sm hover:bg-white/5"
							>
								Clear
							</button>
						)}
						<div className="text-right mr-1 hidden sm:block">
							<p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
								Total
							</p>
							<p className="text-lg font-bold text-amber-300">
								₹{total.toLocaleString('en-IN')}
							</p>
						</div>
						<button
							type="button"
							disabled={selectedSeats.length === 0}
							onClick={handlePayNow}
							className="px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-35 disabled:cursor-not-allowed text-black"
							style={{
								background:
									'linear-gradient(125deg, rgb(251, 191, 36) 0%, rgb(249, 115, 22) 100%)',
							}}
						>
							Pay now
						</button>
					</div>
				</div>
				<p className="max-w-4xl mx-auto text-center text-[10px] text-white/25 mt-2 sm:hidden">
					Total ₹{total.toLocaleString('en-IN')}
				</p>
			</motion.div>
		</div>
	);
}

function BookSeatsFallback() {
	return (
		<div
			className="min-h-screen flex items-center justify-center"
			style={{ background: '#09090f', color: 'rgb(244,244,245)' }}
		>
			<div
				className="w-11 h-11 rounded-full border-2 border-t-transparent animate-spin"
				style={{ borderColor: 'rgba(251,191,36,0.7) transparent transparent transparent' }}
			/>
		</div>
	);
}

export default function BookSeatsPage() {
	return (
		<Suspense fallback={<BookSeatsFallback />}>
			<BookSeatsInner />
		</Suspense>
	);
}
