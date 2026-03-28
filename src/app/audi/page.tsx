"use client";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState, MouseEvent } from "react";

import RowSeats from "@/components/RowSeats";
import { BookingContx } from "@/context/BookingContext";
import { MovieContx } from "@/context/MoviesContext";


const ShowTimes = dynamic(() => import("@/components/ShowTimes"), {
	ssr: false,
});
const CinemaLottie = dynamic(() => import("@/components/CinemaLottie"), {
	ssr: false,
});


const loadGenerateQRCode = async () => {
	if (typeof window !== "undefined") {
		const { generateQRCode } = await import("@/utils/GenerateQRCode");
		return generateQRCode;
	}
	return null;
};

export default function AudiPage() {
	const router = useRouter();
	const { movies_data } = useContext(MovieContx);
	const {
		selectedSeats,
		bookedSeats,
		handleSeatClick,
		handleClear,
		showTime,
		handleSetShow,
		movieId,
		showDate,
		handleSetShowDate,
	} = useContext(BookingContx);

	const [generateQRCodeFn, setGenerateQRCodeFn] = useState<
		((text: string) => Promise<string>) | null
	>(null);

	useEffect(() => {
		loadGenerateQRCode().then(setGenerateQRCodeFn);
	}, []);

	const handlePayNow = async (
		e: MouseEvent<HTMLButtonElement>,
		seats: string[]
	) => {
		if (!generateQRCodeFn) return;
		try {
			const emailContent = await generateQRCodeFn("Hello user");
			await axios.post("api/send-email", { qrcode: emailContent });
		} catch (error) {
			console.error("Error sending email:", error);
		}
		router.push("/payment");
	};

	return (
		<div id="audi">
			{!showTime && (
				<ShowTimes
					handler={handleSetShow}
					showDate={showDate}
					handleSetShowDate={handleSetShowDate}
				/>
			)}

			<div
				id="moveiCard"
				className="relative h-[35vh] md:h-[40vh] md:w-[30%] mx-auto overflow-y-hidden"
			>
				<img
					id="movie-poster"
					className="w-[70vw] translate-x-[-50%] absolute left-[50%] -z-10 rounded-xl"
					src={`https://image.tmdb.org/t/p/w500${movies_data?.[Number(movieId)]?.poster_path || ""}`}
					alt="Movie Poster"
				/>
				<h2 className="text-6xl text-center py-4"></h2>
			</div>

			<div className="screen h-[80px] md:h-[200px] w-[80%] md:w-[60%] mx-auto border-t-2 border-t-blue-500 rounded-full"></div>

			<div className="md:relative">
				{showTime ? (
					<RowSeats
						bookedSeats={bookedSeats}
						selectedSeats={selectedSeats}
						handleSeatClick={handleSeatClick}
					/>
				) : (
					<CinemaLottie />
				)}

				<div
					id="selected-seats"
					className="md:absolute bottom-0 h-[100%] md:max-w-[20%] left-0 p-4"
				>
					{selectedSeats.length > 0 && (
						<>
							<p className="text-gray-400 font-poppins text-xl">
								Selected seats
							</p>
							<div className="flex flex-wrap">
								{selectedSeats.map((seat: string, index: number) => (
									<h2 className="text-blue-500" key={index}>
										{seat},
									</h2>
								))}
							</div>
							<div className="py-2 flex gap-2 my-4">
								<button
									className="px-2 border-2 border-blue-500 rounded-md text-2xl font-lato"
									onClick={handleClear}
								>
									Cancel
								</button>
								<button
									className="px-2 bg-blue-500 rounded-md text-2xl font-lato"
									onClick={(e) => handlePayNow(e, selectedSeats)}
								>
									Pay Now
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
