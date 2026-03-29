"use client";

import { useRouter } from "next/navigation";
import React, { useState, useContext, Suspense, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  CreditCard,
  Mail,
  Sparkles,
  Ticket,
  MapPin,
  Calendar,
  Clock,
  Armchair,
} from "lucide-react";

import { BookingContx } from "@/context/BookingContext";
import QRCodeComponent from "@/components/QrCode";
import { IoMdDoneAll } from "react-icons/io";
import { MovieContx } from "@/context/MoviesContext";
import Spinner from "@/components/Spinner";
import { seatPrice } from "@/components/booking/SeatMap";
import { bookShowMongoId } from "@/utils/bookShowMongoId";
import axios from "axios";

function emailLooksValid(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || "").trim());
}

function PaymentContent() {
  const router = useRouter();
  const { movies_data } = useContext(MovieContx);
  const {
    selectedSeats,
    showTime,
    handleReset,
    movieId,
    showDate,
    bookingVenue,
    bookingMovieTitle,
  } = useContext(BookingContx);

  const [loading, setLoading] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const bookingSavedRef = useRef(false);

  const movieFromList = useMemo(() => {
    if (movieId == null || !Array.isArray(movies_data)) return null;
    return movies_data[Number(movieId)] ?? null;
  }, [movieId, movies_data]);

  const displayTitle =
    movieFromList?.original_title?.trim() ||
    movieFromList?.title?.trim() ||
    bookingMovieTitle ||
    "Your show";

  const posterPath = movieFromList?.poster_path ?? null;
  const posterSrc = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  const subtotal = useMemo(
    () => selectedSeats.reduce((acc, id) => acc + seatPrice(id), 0),
    [selectedSeats]
  );
  const amountPaise = Math.max(100, subtotal) * 100;

  const emailValid = emailLooksValid(emailId);

  useEffect(() => {
    if (selectedSeats.length === 0 && paymentId === null) {
      router.push("/");
    }
  }, [selectedSeats.length, paymentId, router]);

  useEffect(() => {
    if (paymentId == null || bookingSavedRef.current) return;
    bookingSavedRef.current = true;

    const movieIdForApi =
      bookingVenue && showDate && showTime
        ? bookShowMongoId({
          cityId: bookingVenue.cityId,
          theatreId: bookingVenue.theatreId,
          date: showDate,
          showTime: showTime,
        })
        : movieFromList?.original_title?.trim() ||
        bookingMovieTitle ||
        "walk-in";

    (async () => {
      try {
        await axios.post("/api/booking", {
          Show: showTime,
          MovieId: movieIdForApi,
          showDate: showDate,
          seats: selectedSeats,
        });
      } catch (e) {
        console.error(e);
      }
      try {
        await axios.post("/api/send-email", {
          EmailId: emailId.trim(),
          movie_name: displayTitle,
          show: showTime,
          show_date: showDate,
          seats: selectedSeats,
          movie_poster: posterPath || "",
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [paymentId]);

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const makePayment = async () => {
    if (!emailValid) return;
    setLoading(true);
    const res = await initializeRazorpay();
    if (!res) {
      setLoading(false);
      alert("Razorpay SDK failed to load.");
      return;
    }

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
    if (!razorpayKeyId) {
      setLoading(false);
      alert(
        "Razorpay Key ID is missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env (same value as your Razorpay Key ID) and restart the dev server."
      );
      return;
    }

    let orderData;
    try {
      orderData = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountPaise }),
      }).then((t) => t.json());
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert("Could not start checkout.");
      return;
    }

    if (!orderData?.id) {
      setLoading(false);
      alert(orderData?.error || "Could not create payment order.");
      return;
    }

    const options = {
      key: razorpayKeyId,
      name: "Be Watcher",
      currency: "INR",
      amount: amountPaise,
      order_id: orderData.id,
      description: `${displayTitle} — ${selectedSeats.length} seat(s)`,
      image: "https://manuarora.in/logo.png",
      handler(response) {
        setLoading(false);
        setPaymentId(response.razorpay_payment_id);
      },
      prefill: {
        name: "Prasad Gurav",
        email: emailId.trim() || "psgurav2001@gmail.com",
        contact: "1234567890",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", () => {
      setLoading(false);
      alert("Payment failed. Please try again or contact support.");
    });
  };

  const sortedSeats = [...selectedSeats].sort();

  if (paymentId === null) {
    return (
      <div
        className="relative min-h-[calc(100vh-4.5rem)] w-full overflow-hidden pb-16"
        style={{
          fontFamily: "var(--font-bricolage), system-ui, sans-serif",
          color: "rgb(244,244,245)",
          background: "#09090f",
        }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute -top-24 left-[15%] h-[70vh] w-[85vw] opacity-35"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(180,30,60,0.22) 0%, transparent 68%)",
            }}
          />
          <div
            className="absolute bottom-[-20%] right-[-10%] h-[65vh] w-[70vw] opacity-25"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(30,60,200,0.16) 0%, transparent 72%)",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,15,0)_0%,#09090f_88%)]" />
        </div>

        <div className="mx-auto max-w-2xl px-5 pt-10 md:px-8 md:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <p className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.32em] text-white/35">
              <Sparkles className="h-3.5 w-3.5 text-amber-400/70" />
              Checkout
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Almost there
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/45">
              Confirm your email and pay securely. Your e-ticket lands in the inbox
              right after Razorpay confirms the order.
            </p>
          </motion.div>

          <motion.div
            className="relative mt-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.55)] md:p-8"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: "easeOut" }}
          >
            {/* ticket perforation */}
            <div
              className="absolute left-0 top-1/2 hidden h-px w-full -translate-y-1/2 border-t border-dashed border-white/10 md:block"
              aria-hidden
            />
            <div className="relative flex flex-col gap-8 md:flex-row md:gap-10">
              <div className="flex shrink-0 justify-center md:w-[38%] md:justify-start">
                {posterSrc ? (
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  >
                    <div
                      className="absolute -inset-1 rounded-2xl opacity-60 blur-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(251,191,36,0.35), rgba(249,115,22,0.2))",
                      }}
                    />
                    <img
                      src={posterSrc}
                      alt=""
                      className="relative z-10 aspect-[2/3] w-36 rounded-2xl border border-white/10 object-cover shadow-2xl md:w-44"
                    />
                  </motion.div>
                ) : (
                  <div className="flex aspect-[2/3] w-36 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent md:w-44">
                    <Ticket className="h-10 w-10 text-amber-400/50" />
                    <span className="px-2 text-center text-[10px] uppercase tracking-widest text-white/35">
                      Cinema booking
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-5">
                <div>
                  <h2 className="text-xl font-bold leading-snug text-white md:text-2xl">
                    {displayTitle}
                  </h2>
                  {bookingVenue && (
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/45">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        {bookingVenue.theatreName}
                      </span>
                      <span className="text-white/20">·</span>
                      <span>{bookingVenue.cityName}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-white/55">{bookingVenue.screenLabel}</span>
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 rounded-2xl border border-white/[0.06] bg-black/25 px-4 py-3 text-sm">
                  <li className="flex items-center gap-2 text-white/55">
                    <Calendar className="h-4 w-4 shrink-0 text-amber-400/70" />
                    <span className="text-white/80">{showDate || "—"}</span>
                  </li>
                  <li className="flex items-center gap-2 text-white/55">
                    <Clock className="h-4 w-4 shrink-0 text-amber-400/70" />
                    <span className="text-white/80">{showTime || "—"}</span>
                  </li>
                  <li className="flex items-start gap-2 text-white/55">
                    <Armchair className="mt-0.5 h-4 w-4 shrink-0 text-sky-400/80" />
                    <span className="break-words text-white/85">
                      {sortedSeats.join(", ")}
                    </span>
                  </li>
                </ul>

                <div className="flex items-end justify-between gap-4 border-t border-white/[0.08] pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                      Total
                    </p>
                    <p className="text-2xl font-bold text-amber-300">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-white/30">
                    <p>Incl. convenience</p>
                    <p className="text-white/45">Razorpay secure</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="pay-email"
                    className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white/40"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email for e-ticket
                  </label>
                  <input
                    id="pay-email"
                    type="email"
                    autoComplete="email"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none ring-0 transition-[border,background] placeholder:text-white/25 focus:border-amber-400/40 focus:bg-white/[0.06]"
                  />
                  {emailId.length > 0 && !emailValid && (
                    <p className="text-xs text-red-400/90">Enter a valid email address.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={makePayment}
                  disabled={!emailValid || loading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background:
                      "linear-gradient(125deg, rgb(251, 191, 36) 0%, rgb(249, 115, 22) 100%)",
                    boxShadow: "0 16px 40px rgba(249, 115, 22, 0.25)",
                  }}
                >
                  <CreditCard className="h-4 w-4 opacity-80 transition-transform group-hover:scale-110" />
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner />
                      Opening Razorpay…
                    </span>
                  ) : (
                    <span>Pay ₹{subtotal.toLocaleString("en-IN")}</span>
                  )}
                </button>

                <Link
                  href="/book"
                  className="block text-center text-xs text-white/35 underline-offset-4 hover:text-white/55 hover:underline"
                >
                  ← Back to seat selection
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-[calc(100vh-4.5rem)] w-full pb-20"
      style={{
        fontFamily: "var(--font-bricolage), system-ui, sans-serif",
        background: "#09090f",
        color: "rgb(244,244,245)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div
          className="absolute left-1/4 top-0 h-[50vh] w-[80vw]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(34,197,94,0.15) 0%, transparent 65%)",
          }}
        />
      </div>

      <motion.div
        className="mx-auto max-w-md px-5 pt-12 md:pt-16"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <div className="rounded-3xl border border-emerald-500/25 bg-emerald-950/20 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
          >
            <IoMdDoneAll className="mx-auto fill-emerald-400 drop-shadow-[0_0_24px_rgba(52,211,153,0.5)]" size={88} />
          </motion.div>
          <h2 className="mt-6 text-2xl font-bold text-white">Payment successful</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            We&apos;ve queued your booking and sent the details to{" "}
            <span className="text-amber-200/90">{emailId.trim()}</span>.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 px-4 py-5 text-left">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Booking</p>
            <p className="mt-1 font-semibold text-white/90">{displayTitle}</p>
            <p className="mt-3 text-xs text-white/45">
              <strong className="text-white/65">Seats:</strong>{" "}
              {sortedSeats.join(", ")}
            </p>
            {bookingVenue && (
              <p className="mt-1 text-xs text-white/45">
                {bookingVenue.theatreName} · {bookingVenue.cityName}
              </p>
            )}
          </div>

          {selectedSeats.length > 0 && (
            <div className="mt-8 inline-block rounded-2xl border border-white/10 bg-white p-3 shadow-lg">
              <QRCodeComponent value={sortedSeats.join(",")} size={200} />
            </div>
          )}
          <p className="mt-4 text-[11px] text-white/30">Show this QR at the venue (demo)</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                handleReset();
                router.push("/movies");
              }}
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
            >
              Book another show
            </button>
            <Link
              href="/"
              className="rounded-xl px-6 py-3 text-center text-sm font-semibold text-amber-300 transition-colors hover:text-amber-200"
            >
              Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-[50vh] items-center justify-center"
          style={{ background: "#09090f", color: "rgb(244,244,245)" }}
        >
          <Spinner />
        </div>
			}
    >
      <PaymentContent />
    </Suspense>
  );
}
