const Razorpay = require("razorpay");
const shortid = require("shortid");
import { NextResponse } from "next/server";

export async function POST(req, res) {
  if (req.method === "POST") {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_API_SECRET,
      });

      const payment_capture = 1;
      const amount = 1;
      const currency = "INR";
      const options = {
        amount: (amount * 100).toString(),
        currency,
        receipt: shortid.generate(),
        payment_capture,
      };
  
      try {
        const response = await razorpay.orders.create(options);
        // res.status(200).json({
        //   id: response.id,
        //   currency: response.currency,
        //   amount: response.amount,
        // });
        return NextResponse.json({
            message: "success",
            id: response.id,
            currency: response.currency,
            amount: response.amount,
          }, {
            status: 200,
          })


      } catch (err) {
        console.error(err);
        // res.status(400).json({ error: "Failed to create Razorpay order", details: err.message });
      }
    } else {
      // Handle any other HTTP method
      res.status(405).json({ error: "Method Not Allowed" });
    }
  }
  