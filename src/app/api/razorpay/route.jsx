const Razorpay = require("razorpay");
const shortid = require("shortid");
import { NextResponse } from "next/server";

/**
 * Creates a Razorpay order. Pass { amount } in the body where amount is in paise (e.g. ₹50 → 5000).
 */
export async function POST(req) {
	try {
		if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_API_SECRET) {
			return NextResponse.json(
				{ error: "Razorpay is not configured on the server." },
				{ status: 500 }
			);
		}

		const body = await req.json().catch(() => ({}));
		const raw = body?.amount;
		const amountPaise =
			typeof raw === "number" && Number.isFinite(raw) && raw >= 100
				? Math.floor(raw)
				: 100;

		const razorpay = new Razorpay({
			key_id: process.env.RAZORPAY_API_KEY,
			key_secret: process.env.RAZORPAY_API_SECRET,
		});

		const response = await razorpay.orders.create({
			amount: String(amountPaise),
			currency: "INR",
			receipt: shortid.generate(),
			payment_capture: 1,
		});

		return NextResponse.json(
			{
				message: "success",
				id: response.id,
				currency: response.currency,
				amount: response.amount,
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error(err);
		return NextResponse.json(
			{
				error: "Failed to create Razorpay order",
				details: err?.message || String(err),
			},
			{ status: 400 }
		);
	}
}
