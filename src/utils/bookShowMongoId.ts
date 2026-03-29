
export function bookShowMongoId(params: {
	cityId: string;
	theatreId: string;
	date: string;
	showTime: string;
}): string {
	return `bw:${params.cityId}:${params.theatreId}:${params.date}:${params.showTime}`;
}
