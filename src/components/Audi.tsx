const Audi = () => {
    const seats = Array.from({ length: 30 }, (_, i) => i + 1);
    const seatRows = [
        { row: 'A', seats: seats.slice(0, 5) },
        { row: 'B', seats: seats.slice(5, 10) },
        { row: 'C', seats: seats.slice(10, 15) },
        { row: 'D', seats: seats.slice(15, 20) },
        { row: 'E', seats: seats.slice(20, 25) },
        { row: 'F', seats: seats.slice(25, 30) },
    ];
    return (
        <div>
            {seatRows.map((row, idx) => (
                <div>
                    <h5>{row.row}</h5>
                    <div>
                        {row.seats.map((seat) => (
                            <div>{seat}</div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
