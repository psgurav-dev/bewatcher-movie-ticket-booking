import React, { useState, MouseEvent } from 'react';
import { MdEventSeat } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function RowSeats(props: any) {
    const seats = Array.from({ length: 20 }, (_, i) => i + 1);
    return (
        <motion.div
            className="seats w-[45%] mx-auto flex flex-col gap-4 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5 }}
        >
            {seats.map((row: any, index: any) => (
                <div key={index} className="row flex justify-evenly gap-2 items-center">
                    <h2 className="text-yellow-500">{Object.keys(row)[0]}</h2>
                    {row[Object.keys(row)[0]].map((seat: number, seatInex: any) => {
                        const isSeatSelected: boolean = (props.selectedSeats as string[]).includes(
                            Object.keys(row)[0] + seat
                        );
                        const booked = props.bookedSeats.includes(Object.keys(row)[0] + seat);
                        return (
                            <div
                                key={seatInex}
                                className={`cursor-pointer ${
                                    isSeatSelected ? 'selected-seat' : ''
                                }`}
                            >
                                <MdEventSeat
                                    className={`${isSeatSelected ? 'text-blue-500' : ''} ${
                                        booked ? 'text-red-500 pointer-events-none' : ''
                                    }`}
                                    size={50}
                                    onClick={(e: MouseEvent<SVGElement>) =>
                                        props.handleSeatClick(e, Object.keys(row)[0], seat)
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </motion.div>
    );
}
