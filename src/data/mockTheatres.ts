export type ShowAvailability = 'available' | 'filling_fast' | 'sold_out';

export interface ShowSlot {
	time: string;
	availability: ShowAvailability;
}

export interface Theatre {
	id: string;
	name: string;
	chain: string;
	area: string;
	distanceKm: number;
	amenities: string[];
	screenLabel: string;
	shows: ShowSlot[];
}

export interface City {
	id: string;
	name: string;
	state: string;
	theatres: Theatre[];
}

export const MOCK_CITIES: City[] = [
	{
		id: 'mumbai',
		name: 'Mumbai',
		state: 'Maharashtra',
		theatres: [
			{
				id: 'inox-rcity',
				name: 'INOX R-City Mall',
				chain: 'INOX',
				area: 'Ghatkopar West',
				distanceKm: 4.2,
				amenities: ['Dolby Atmos', 'Recliners', 'Food Court'],
				screenLabel: 'Screen 3',
				shows: [
					{ time: '09:30 AM', availability: 'available' },
					{ time: '12:45 PM', availability: 'filling_fast' },
					{ time: '04:10 PM', availability: 'available' },
					{ time: '07:30 PM', availability: 'available' },
					{ time: '10:45 PM', availability: 'sold_out' },
				],
			},
			{
				id: 'pvr-infiniti',
				name: 'PVR Infiniti Malad',
				chain: 'PVR',
				area: 'Malad West',
				distanceKm: 7.1,
				amenities: ['4K Laser', 'Dolby Atmos', 'IMAX'],
				screenLabel: 'Audi 1',
				shows: [
					{ time: '10:00 AM', availability: 'available' },
					{ time: '01:15 PM', availability: 'available' },
					{ time: '04:45 PM', availability: 'filling_fast' },
					{ time: '08:20 PM', availability: 'available' },
				],
			},
			{
				id: 'cinepolis-thane',
				name: 'Cinépolis Viviana',
				chain: 'Cinépolis',
				area: 'Thane East',
				distanceKm: 12.4,
				amenities: ['D-Box', 'Recliners'],
				screenLabel: 'Audi 4',
				shows: [
					{ time: '11:20 AM', availability: 'available' },
					{ time: '02:50 PM', availability: 'available' },
					{ time: '06:00 PM', availability: 'sold_out' },
					{ time: '09:15 PM', availability: 'available' },
				],
			},
		],
	},
	{
		id: 'delhi',
		name: 'Delhi NCR',
		state: 'Delhi',
		theatres: [
			{
				id: 'pvr-saket',
				name: 'PVR Select Citywalk',
				chain: 'PVR',
				area: 'Saket',
				distanceKm: 5.8,
				amenities: ['4DX', 'Dolby Atmos'],
				screenLabel: 'Screen 2',
				shows: [
					{ time: '10:15 AM', availability: 'available' },
					{ time: '01:30 PM', availability: 'filling_fast' },
					{ time: '05:00 PM', availability: 'available' },
					{ time: '08:40 PM', availability: 'available' },
				],
			},
			{
				id: 'inox-dlf',
				name: 'INOX DLF Promenade',
				chain: 'INOX',
				area: 'Vasant Kunj',
				distanceKm: 9.2,
				amenities: ['Laser', 'Recliners', 'Food Court'],
				screenLabel: 'Audi 2',
				shows: [
					{ time: '09:45 AM', availability: 'available' },
					{ time: '12:20 PM', availability: 'available' },
					{ time: '03:55 PM', availability: 'available' },
					{ time: '07:10 PM', availability: 'sold_out' },
				],
			},
		],
	},
	{
		id: 'bengaluru',
		name: 'Bengaluru',
		state: 'Karnataka',
		theatres: [
			{
				id: 'rxc-whitefield',
				name: 'Rockline Cinemas Whitefield',
				chain: 'Rockline',
				area: 'Whitefield',
				distanceKm: 3.5,
				amenities: ['Dolby Atmos', 'Luxe Seats'],
				screenLabel: 'Audi 1',
				shows: [
					{ time: '10:30 AM', availability: 'available' },
					{ time: '02:00 PM', availability: 'filling_fast' },
					{ time: '05:30 PM', availability: 'available' },
					{ time: '09:00 PM', availability: 'available' },
				],
			},
			{
				id: 'pvr-forum',
				name: 'PVR Nexus Forum',
				chain: 'PVR',
				area: 'Koramangala',
				distanceKm: 6.7,
				amenities: ['IMAX', 'Dolby Vision'],
				screenLabel: 'Screen 5',
				shows: [
					{ time: '11:00 AM', availability: 'available' },
					{ time: '02:40 PM', availability: 'available' },
					{ time: '06:15 PM', availability: 'available' },
					{ time: '09:45 PM', availability: 'filling_fast' },
				],
			},
		],
	},
	{
		id: 'hyderabad',
		name: 'Hyderabad',
		state: 'Telangana',
		theatres: [
			{
				id: 'asian-rk',
				name: 'Asian Cinemas RK Cineplex',
				chain: 'Asian',
				area: 'Banjara Hills',
				distanceKm: 4.9,
				amenities: ['Dolby Atmos', 'Recliners'],
				screenLabel: 'Audi 3',
				shows: [
					{ time: '09:50 AM', availability: 'available' },
					{ time: '01:10 PM', availability: 'available' },
					{ time: '04:30 PM', availability: 'sold_out' },
					{ time: '07:50 PM', availability: 'available' },
					{ time: '11:00 PM', availability: 'available' },
				],
			},
		],
	},
	{
		id: 'chennai',
		name: 'Chennai',
		state: 'Tamil Nadu',
		theatres: [
			{
				id: 'spi-sathyam',
				name: 'SPI Sathyam Royapettah',
				chain: 'SPI Cinemas',
				area: 'Royapettah',
				distanceKm: 2.3,
				amenities: ['Dolby Atmos', 'Club Class'],
				screenLabel: 'Screen 1',
				shows: [
					{ time: '10:45 AM', availability: 'filling_fast' },
					{ time: '02:15 PM', availability: 'available' },
					{ time: '05:45 PM', availability: 'available' },
					{ time: '09:30 PM', availability: 'available' },
				],
			},
			{
				id: 'luxe-phoenix',
				name: 'Luxe Cinemas Phoenix',
				chain: 'Jazz',
				area: 'Velachery',
				distanceKm: 8.1,
				amenities: ['Laser', 'Bar & Lounge'],
				screenLabel: 'Audi 2',
				shows: [
					{ time: '11:30 AM', availability: 'available' },
					{ time: '03:00 PM', availability: 'available' },
					{ time: '06:45 PM', availability: 'available' },
				],
			},
		],
	},
];

export function findCity(cityId: string): City | undefined {
	return MOCK_CITIES.find((c) => c.id === cityId);
}

export function findTheatre(cityId: string, theatreId: string): Theatre | undefined {
	const city = findCity(cityId);
	return city?.theatres.find((t) => t.id === theatreId);
}

export function formatDateLabel(d: Date): string {
	return d.toLocaleDateString('en-IN', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
	});
}

export function toISODate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}
