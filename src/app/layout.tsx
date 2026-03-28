import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

import BookingContx from "@/context/BookingContext";
import MovieContx from "@/context/MoviesContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Be Watcher",
    description: "Book your show",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Navbar />
                <MovieContx>
                    <BookingContx>
                        <div className="pt-96">{children}</div>
                    </BookingContx>
                </MovieContx>
            </body>
        </html>
    );
}
