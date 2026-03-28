import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, Manrope, Inter_Tight, Poppins } from "next/font/google";
import "./globals.css";

import BookingContx from "@/context/BookingContext";
import MovieContx from "@/context/MoviesContext";
import CustomNavbar from "@/components/navbar";

const bricolage = Bricolage_Grotesque({
    variable: "--font-bricolage",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600", "700"],
});

const sans = Inter({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    weight: ["400", "700"],
});

const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
    weight: ["400", "700"],
})

const interTight = Inter_Tight({
    variable: "--font-interTight",
    subsets: ["latin"],
    weight: ["400", "700"],
})

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "700"],
})

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
            <body className={`${sans.variable} ${bricolage.variable} ${manrope.variable} ${poppins.variable} ${interTight.variable} antialiased bg-white`}>

                <CustomNavbar />
                <MovieContx>
                    <BookingContx>
                        <div className="pt-[4.5rem]">{children}</div>
                    </BookingContx>
                </MovieContx>
            </body>
        </html>
    );
}
