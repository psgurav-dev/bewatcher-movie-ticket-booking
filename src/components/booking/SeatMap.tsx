'use client';

import React, { MouseEvent } from 'react';
import { MdEventSeat } from 'react-icons/md';
import { motion } from 'motion/react';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] as const;
const LEFT_SEATS = [1, 2, 3, 4, 5, 6];
const RIGHT_SEATS = [7, 8, 9, 10, 11, 12];

export type SeatTier = 'economy' | 'classic' | 'prime';

export function tierForRow(row: string): SeatTier {
	const i = ROWS.indexOf(row as (typeof ROWS)[number]);
	if (i < 4) return 'economy';
	if (i < 8) return 'classic';
	return 'prime';
}

export function priceForTier(tier: SeatTier): number {
	switch (tier) {
		case 'economy':
			return 140;
		case 'classic':
			return 180;
		case 'prime':
			return 230;
	}
}

function tierStyles(tier: SeatTier): { ring: string; label: string } {
	switch (tier) {
		case 'economy':
			return {
				ring: 'text-emerald-400/90',
				label: 'text-emerald-300/80',
			};
		case 'classic':
			return {
				ring: 'text-amber-400/90',
				label: 'text-amber-300/80',
			};
		case 'prime':
			return {
				ring: 'text-fuchsia-400/90',
				label: 'text-fuchsia-300/80',
			};
	}
}

interface SeatMapProps {
	selectedSeats: string[];
	lockedSeats: string[];
	handleSeatClick: (e: MouseEvent<SVGElement>, rowName: string, seatNumber: number) => void;
}

export default function SeatMap({
	selectedSeats,
	lockedSeats,
	handleSeatClick,
}: SeatMapProps) {
	const locked = new Set(lockedSeats);

	return (
		<motion.div
			className="w-full max-w-3xl mx-auto flex flex-col gap-3 px-1"
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: 'easeOut' }}
		>
			{ROWS.map((row) => {
				const tier = tierForRow(row);
				const { ring, label } = tierStyles(tier);
				return (
					<div
						key={row}
						className="flex items-center gap-1 sm:gap-2 justify-center flex-wrap sm:flex-nowrap"
					>
						<span
							className={`w-6 sm:w-8 text-center text-xs font-bold shrink-0 ${label}`}
						>
							{row}
						</span>
						<div className="flex items-center gap-0.5 sm:gap-1">
							{LEFT_SEATS.map((n) => {
								const id = `${row}${n}`;
								const selected = selectedSeats.includes(id);
								const unavailable = locked.has(id);
								return (
									<button
										key={id}
										type="button"
										disabled={unavailable}
										aria-label={`Seat ${id}${unavailable ? ' unavailable' : ''}${selected ? ' selected' : ''}`}
										className="p-0 border-0 bg-transparent leading-none disabled:opacity-35"
										onClick={(e) =>
											!unavailable &&
											handleSeatClick(
												e as unknown as MouseEvent<SVGElement>,
												row,
												n
											)
										}
									>
										<MdEventSeat
											className={`${ring} ${selected ? '!text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]' : ''} ${unavailable ? '!text-red-500/80 pointer-events-none' : 'hover:opacity-90'}`}
											size={36}
										/>
									</button>
								);
							})}
						</div>
						<div
							className="hidden sm:block w-6 lg:w-10 shrink-0 mx-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]"
							aria-hidden
							title="Aisle"
						/>
						<div className="flex items-center gap-0.5 sm:gap-1">
							{RIGHT_SEATS.map((n) => {
								const id = `${row}${n}`;
								const selected = selectedSeats.includes(id);
								const unavailable = locked.has(id);
								return (
									<button
										key={id}
										type="button"
										disabled={unavailable}
										aria-label={`Seat ${id}${unavailable ? ' unavailable' : ''}${selected ? ' selected' : ''}`}
										className="p-0 border-0 bg-transparent leading-none disabled:opacity-35"
										onClick={(e) =>
											!unavailable &&
											handleSeatClick(
												e as unknown as MouseEvent<SVGElement>,
												row,
												n
											)
										}
									>
										<MdEventSeat
											className={`${ring} ${selected ? '!text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]' : ''} ${unavailable ? '!text-red-500/80 pointer-events-none' : 'hover:opacity-90'}`}
											size={36}
										/>
									</button>
								);
							})}
						</div>
					</div>
				);
			})}
		</motion.div>
	);
}

export function seatPrice(seatId: string): number {
	if (seatId.length < 2) return priceForTier('economy');
	const row = seatId[0];
	return priceForTier(tierForRow(row));
}
