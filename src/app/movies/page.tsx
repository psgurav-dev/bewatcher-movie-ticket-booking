'use client';
import React, { useContext, MouseEvent, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingContx } from '@/context/BookingContext';
import { MovieContx } from '@/context/MoviesContext';

interface Movie {
    id: number;
    poster_path: string;
    original_title: string;
    vote_average?: number;
    release_date?: string;
}

interface MovieCardProps {
    movie: Movie;
    index: number;
    isSelected: boolean;
    onBook: (e: MouseEvent<HTMLButtonElement>, index: number) => void;
}

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } },
};


function CinematicBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Base */}
            <div className="absolute inset-0" style={{ background: '#09090f' }} />

            {/* Projector bloom — top center warm rose */}
            <div
                className="absolute"
                style={{
                    top: '-18%',
                    left: '30%',
                    width: '70vw',
                    height: '65vh',
                    background: 'radial-gradient(ellipse at center, rgba(180,30,60,0.18) 0%, rgba(120,20,50,0.08) 45%, transparent 72%)',
                    filter: 'blur(2px)',
                }}
            />

            {/* Cobalt spill — bottom left */}
            <div
                className="absolute"
                style={{
                    bottom: '-10%',
                    left: '-8%',
                    width: '55vw',
                    height: '55vh',
                    background: 'radial-gradient(ellipse at center, rgba(30,60,200,0.13) 0%, rgba(20,40,140,0.05) 50%, transparent 72%)',
                    filter: 'blur(2px)',
                }}
            />

            {/* Gold ember — bottom right */}
            <div
                className="absolute"
                style={{
                    bottom: '-6%',
                    right: '-4%',
                    width: '40vw',
                    height: '45vh',
                    background: 'radial-gradient(ellipse at center, rgba(200,120,20,0.11) 0%, rgba(160,80,10,0.04) 50%, transparent 72%)',
                    filter: 'blur(2px)',
                }}
            />

            {/* Midfield violet mist */}
            <div
                className="absolute"
                style={{
                    top: '35%',
                    right: '18%',
                    width: '30vw',
                    height: '30vh',
                    background: 'radial-gradient(ellipse at center, rgba(100,40,180,0.09) 0%, transparent 70%)',
                }}
            />

            {/* Fine film-grain noise overlay via SVG turbulence */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
                <filter id="grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain)" />
            </svg>

            {/* Subtle horizontal scan-line vignette at top */}
            <div
                className="absolute inset-x-0 top-0 h-48"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)' }}
            />
            {/* Bottom vignette */}
            <div
                className="absolute inset-x-0 bottom-0 h-40"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}
            />
        </div>
    );
}

function StarRating({ rating }: { rating: number }) {
    const filled = Math.round((rating / 10) * 5);
    return (
        <div className="flex items-center gap-[3px]">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-[11px] h-[11px] ${i < filled ? 'text-amber-400' : 'text-white/15'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="text-white/40 text-[10px] font-mono ml-1">{rating.toFixed(1)}</span>
        </div>
    );
}

function MovieCard({ movie, index, isSelected, onBook }: MovieCardProps) {
    const [hovered, setHovered] = useState(false);
    const year = movie.release_date?.slice(0, 4) ?? '';

    return (
        <motion.article
            variants={cardVariants}
            className="relative flex flex-col gap-3 cursor-pointer group"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            whileHover={{ y: -10 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >

            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '2/3' }}>


                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            className="absolute -inset-[2px] rounded-2xl z-20 pointer-events-none"
                            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #c026d3 100%)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="absolute inset-[2px] rounded-[14px] bg-[#09090f]" />
                        </motion.div>
                    )}
                </AnimatePresence>


                <motion.img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.original_title}
                    className="absolute inset-0 w-full h-full object-cover"
                    animate={{ scale: hovered ? 1.03 : 1 }}
                    transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                />


                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent z-10" />

                {!!movie.vote_average && movie.vote_average > 0 && (
                    <div className="absolute top-3 right-3 z-30">
                        <div
                            className="flex items-center gap-1 px-2 py-[3px] rounded-full border border-amber-400/25"
                            style={{ background: 'rgba(180,120,0,0.18)', backdropFilter: 'blur(8px)' }}
                        >
                            <svg className="w-[9px] h-[9px] text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-amber-300 text-[9px] font-bold font-mono">{movie.vote_average.toFixed(1)}</span>
                        </div>
                    </div>
                )}
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            className="absolute bottom-0 inset-x-0 z-30 p-4"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                        >
                            {!!movie.vote_average && movie.vote_average > 0 && (
                                <div className="mb-3">
                                    <StarRating rating={movie.vote_average} />
                                </div>
                            )}

                            <motion.button
                                onClick={(e) => onBook(e, index)}
                                className="w-full py-[9px] rounded-xl text-[10px] font-bold tracking-[0.14em] uppercase relative overflow-hidden text-white"
                                style={{
                                    background: 'linear-gradient(120deg, #1d4ed8, #7c3aed)',
                                }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Book Ticket
                                {/* shimmer */}
                                <motion.span
                                    aria-hidden
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                    animate={{ x: ['-120%', '220%'] }}
                                    transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
                                />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-1 space-y-[3px]">
                <h3
                    className="text-white/90 text-sm font-semibold leading-snug line-clamp-1 transition-colors group-hover:text-white"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                >
                    <Link
                        href={`/movies/${movie.id}`}
                        className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 rounded"
                    >
                        {movie.original_title}
                    </Link>
                </h3>
                {year && (
                    <p className="text-white/35 text-[11px] font-mono">{year}</p>
                )}
            </div>
        </motion.article>
    );
}

function EmptyState() {
    return (
        <motion.div
            className="flex flex-col items-center justify-center py-40 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
                <svg className="w-7 h-7 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4}
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
            </div>
            <p className="text-white/30 text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>No films scheduled right now</p>
        </motion.div>
    );
}

function MoviesPage() {
    const { movies_data } = useContext(MovieContx);
    const { movieId, handleSetMovie } = useContext(BookingContx);
    const hasMovies = Array.isArray(movies_data) && movies_data.length > 0;

    return (
        <>
            <CinematicBackground />
            <main
                className="relative min-h-screen w-full"
                style={{ fontFamily: "'Sora', sans-serif" }}
            >
                <div className="max-w-[1380px] mx-auto px-8 md:px-12 lg:px-16 py-14">
                    <motion.header
                        className="mb-14"
                        initial={{ opacity: 0, y: -18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                    >
                        <p className="text-[10px] uppercase tracking-[0.32em] text-white/30 font-mono mb-3">
                            Now Showing
                        </p>
                        <h1 className="text-[42px] md:text-[56px] font-extrabold text-white leading-[1.05] tracking-[-0.02em]">
                            Lights,{' '}
                            <span
                                className="relative inline-block"
                                style={{
                                    background: 'linear-gradient(95deg, #f59e0b 0%, #ef4444 45%, #c026d3 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Camera
                            </span>
                            , Book.
                        </h1>
                    </motion.header>

                    {hasMovies ? (
                        <section>
                            <motion.div
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {movies_data.map((movie: Movie, index: number) => (
                                    <MovieCard
                                        key={index}
                                        movie={movie}
                                        index={index}
                                        isSelected={movieId === index}
                                        onBook={(e, idx) => handleSetMovie(e, idx)}
                                    />
                                ))}
                            </motion.div>
                        </section>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </main>
        </>
    );
}

export default MoviesPage;