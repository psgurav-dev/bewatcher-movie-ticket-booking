import Booking from '@/models/Bokings';
import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/database/dbConfig';

connect();

export async function POST(request: NextRequest) {
    try {
        let reqBody = await request.json();

        // console.log('data', reqBody);
        const { Show, MovieId, showDate, seats } = reqBody;

        let existingShow = await Booking.findOneAndUpdate(
            { date: showDate, movieId: MovieId, showtime: Show },
            { $push: { seats: { $each: seats } } },
            { new: true } // Set to true to return the modified document rather than the original
        );
        if (existingShow) {
            console.log('Seats updated successfully:', existingShow);
        } else {
            console.log('show dosent exist');
            const newBooking = new Booking({
                showtime: Show,
                movieId: MovieId,
                date: showDate,
                seats: seats,
            });
            const bookingStat = await newBooking.save();
            console.log(bookingStat);
        }
    } catch (e: any) {
        return NextResponse.json(
            {
                data: String(e),
            },
            {
                status: 200,
            }
        );
    }

    return NextResponse.json(
        {
            data: 'Booked',
        },
        {
            status: 200,
        }
    );
}
