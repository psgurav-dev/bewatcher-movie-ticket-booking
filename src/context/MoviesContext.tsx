"use client";
import React, { useEffect, useState, createContext } from "react";

interface MovieContextType {
	movies_data: any[] | null; // Allow null initially
}

const defaultMovieContx: MovieContextType = {
	movies_data: null, // Initialize as null
};

export const MovieContx = createContext<MovieContextType>(defaultMovieContx);

type Props = {
	children: React.ReactNode;
};

export default function MoviesContext({ children }: Props) {
	const [movies_data, setMovies_data] = useState<any[] | null>(null);

	useEffect(() => {
		const getMoviesData = async () => {
			try {
				const response = await fetch("/api/movies", {
					method: "GET",
					cache: "no-store",
				});

				if (!response.ok) {
					throw new Error("Failed to fetch movies");
				}
				const jsonData = await response.json();
				console.log("Fetched Movies Data:", jsonData);
				setMovies_data(jsonData?.results || []);
			} catch (error) {
				console.error("Error fetching movies:", error);
			}
		};

		getMoviesData();
	}, []);

	const contextValue = {
		movies_data,
	};

	return (
		<MovieContx.Provider value={contextValue}>{children}</MovieContx.Provider>
	);
}
