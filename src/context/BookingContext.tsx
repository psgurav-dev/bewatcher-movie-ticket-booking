'use client'
import React, { createContext, MouseEvent, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

import { MovieContx } from './MoviesContext'
import { bookShowMongoId } from '@/utils/bookShowMongoId'

export interface BookingVenue {
    cityId: string;
    cityName: string;
    theatreId: string;
    theatreName: string;
    screenLabel: string;
}

interface MyContextType {
    selectedSeats: string[];
    bookedSeats: string[];
    showTime : string | null;
    movieId : number | null;
    showDate: string | null;
    bookingVenue: BookingVenue | null;
    bookingMovieTitle: string | null;
    handleSeatClick: (e: MouseEvent<SVGElement>, rowName: string, seatNumber: number) => void;
    handleClear : (e:MouseEvent<HTMLButtonElement>) => void;
    handleSetShow : (e:MouseEvent<HTMLButtonElement>,Time:string) => void;
    handleReset : () => void;
    handleSetMovie: (e:MouseEvent<HTMLButtonElement>,id:number) => void;
    handleSetShowDate:(e:MouseEvent<HTMLButtonElement>,date:string) => void;
    clearSeatSelection: () => void;
    syncBookingSession: (payload: {
        showTime: string;
        showDate: string;
        venue?: BookingVenue | null;
        movieTitle?: string | null;
    }) => void;
}

const defaultContextValue: MyContextType = {
    selectedSeats: [],
    bookedSeats:[],
    showTime : null,
    movieId:null,
 showDate : null,
    bookingVenue: null,
    bookingMovieTitle: null,
    handleSeatClick: () => {},
    handleClear: () => {},
    handleSetShow: () => {},
    handleReset:() => {},
    handleSetMovie:() => {},
    handleSetShowDate:() => {},
    clearSeatSelection: () => {},
    syncBookingSession: () => {},
};

export const BookingContx = createContext<MyContextType>(defaultContextValue);

type Props = {
    children: React.ReactNode;
};

export default function BookingContext(props:Props) {
    const router = useRouter()
    const [movieId,setMovieId] = React.useState<number | null>(null)
    const [selectedSeats, setSelectedSeats] = React.useState<string[]>([]);
    const [showTime, setShowTime] = React.useState<string | null>(null);
    const [showDate, setShowDate] = React.useState<string | null>(null)
    const [bookedSeats, setBookedSeats] = React.useState<string[]>([]);
    const [bookingVenue, setBookingVenue] = React.useState<BookingVenue | null>(null);
    const [bookingMovieTitle, setBookingMovieTitle] = React.useState<string | null>(null);

    const { movies_data } = React.useContext(MovieContx)

    React.useEffect(()=>{
        const getReservedSeats = async ()=>{
            if (!showTime || !showDate) {
                setBookedSeats([]);
                return;
            }

            let movieIdForQuery: string | null = null;

            if (bookingVenue) {
                movieIdForQuery = bookShowMongoId({
                    cityId: bookingVenue.cityId,
                    theatreId: bookingVenue.theatreId,
                    date: showDate,
                    showTime: showTime,
                });
            } else if (movieId != null && Array.isArray(movies_data)) {
                const movie = movies_data[Number(movieId)];
                movieIdForQuery = movie?.original_title?.trim() || null;
            }

            if (!movieIdForQuery) {
                setBookedSeats([]);
                return;
            }

            const data = {
                Show: showTime,
                MovieId: movieIdForQuery,
                Date: showDate,
            };
            try {
                const response = await axios.post('/api/booking/booked', data);
                const payload = response.data?.data;
                if (Array.isArray(payload)) {
                    setBookedSeats(
                        payload.flatMap((s: unknown) =>
                            Array.isArray(s) ? s : [s]
                        ).filter((s): s is string => typeof s === 'string')
                    );
                } else {
                    setBookedSeats([]);
                }
            } catch {
                setBookedSeats([]);
            }
        }
        getReservedSeats()
    },[showTime, movieId, showDate, movies_data, bookingVenue])

    const handleSetShowDate = (e:MouseEvent<HTMLButtonElement>,date:string)=>{
        setShowDate(date)
    }
    const handleSetShow = (e: MouseEvent<HTMLButtonElement>, Time: string) => {
        setShowTime(Time)
    }

    const handleSeatClick = (e: MouseEvent<SVGElement>, rowName: String, seatNumber: number) => {
        let Seat: string = rowName + seatNumber.toString()
        setSelectedSeats((prevSelectedSeats) => {
            if (prevSelectedSeats.includes(Seat)) {
                return prevSelectedSeats.filter((selectedSeat) => selectedSeat !== Seat);
            } else {
                return [...prevSelectedSeats, Seat];
            }
        });
    }

    const handleSetMovie = (e:MouseEvent<HTMLButtonElement>,id:number)=>[
        setMovieId(id),
        router.push('/audi')
    ]

    const handleClear = (e:MouseEvent<HTMLButtonElement>) =>{
        setSelectedSeats([])
    }

    const clearSeatSelection = useCallback(() => {
        setSelectedSeats([]);
    }, []);

    const syncBookingSession = useCallback((payload: {
        showTime: string;
        showDate: string;
        venue?: BookingVenue | null;
        movieTitle?: string | null;
    }) => {
        setShowTime(payload.showTime);
        setShowDate(payload.showDate);
        if (payload.venue !== undefined) setBookingVenue(payload.venue);
        if (payload.movieTitle !== undefined) setBookingMovieTitle(payload.movieTitle);
    }, []);

    const handleReset = () =>{
        setSelectedSeats([])
        setShowTime(null)
        setBookingVenue(null);
        setBookingMovieTitle(null);
    }
    
    const contextValue: MyContextType = {
        selectedSeats: selectedSeats,
        bookedSeats:bookedSeats,
        handleSeatClick: handleSeatClick,
        handleClear:handleClear,
        showTime:showTime,
        handleSetShow:handleSetShow,
        handleReset:handleReset,
        movieId:movieId,
        handleSetMovie:handleSetMovie,
        showDate:showDate,
        handleSetShowDate:handleSetShowDate,
        bookingVenue,
        bookingMovieTitle,
        clearSeatSelection,
        syncBookingSession,
    }

    return (
        <BookingContx.Provider value={contextValue}>
            {props.children}
        </BookingContx.Provider>
    )
}
