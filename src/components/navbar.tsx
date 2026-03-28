"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	motion,
	AnimatePresence,
	useReducedMotion,
	useScroll,
	useMotionValueEvent,
} from "motion/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/utils/tailwind-config";

const LINKS = [
	{ label: "Discover", href: "/" },
	{ label: "Book Tickets", href: "/movies" },
] as const;

function pathActive(href: string, pathname: string | null) {
	if (!pathname) return false;
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
	const pathname = usePathname();
	const reduceMotion = useReducedMotion();
	const { scrollY } = useScroll();
	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	useMotionValueEvent(scrollY, "change", (y) => {
		setScrolled(y > 28);
	});

	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!mobileOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [mobileOpen]);

	const spring = reduceMotion
		? { duration: 0.2 }
		: { type: "spring" as const, stiffness: 420, damping: 38 };
	const layoutSpring = reduceMotion
		? { duration: 0 }
		: { type: "spring" as const, stiffness: 380, damping: 34 };

	return (
		<motion.header
			role="banner"
			initial={false}
			animate={{
				backgroundColor: scrolled
					? "rgba(9, 9, 15, 0.82)"
					: "rgba(9, 9, 15, 0.48)",
			}}
			transition={spring}
			style={{
				backdropFilter: "blur(18px) saturate(1.12)",
				WebkitBackdropFilter: "blur(18px) saturate(1.12)",
			}}
			className={cn(
				"fixed inset-x-0 top-0 z-50 border-b border-white/[0.07]",
				"shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
			)}
		>
			<motion.div
				className="mx-auto flex max-w-[1380px] items-center justify-between px-5 md:px-10 lg:px-14"
				initial={false}
				animate={{ height: scrolled ? 60 : 68 }}
				transition={spring}
			>
				<Link
					href="/"
					className="group relative z-10 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]"
					aria-label="Bewatcher home"
				>
					<motion.span
						className="inline-flex items-baseline gap-0"
						whileHover={reduceMotion ? {} : { scale: 1.02 }}
						transition={{ type: "spring", stiffness: 520, damping: 28 }}
					>
						<span className="font-bricolage text-xl font-semibold tracking-[-0.04em] text-white md:text-[2.35rem]">
							Bewatcher
						</span>
					</motion.span>
				</Link>

				<nav aria-label="Main" className="hidden md:block">
					<ul className="flex items-center gap-0.5">
						{LINKS.map((item) => {
							const active = pathActive(item.href, pathname);
							return (
								<li key={item.href} className="relative">
									<Link
										href={item.href}
										className={cn(
											"relative z-10 block px-4 py-2 text-sm font-medium tracking-wide transition-colors",
											active
												? "text-white"
												: "text-white/55 hover:text-white/90",
										)}
									>
										{active && (
											<motion.span
												layoutId="navbar-active-pill"
												className="absolute inset-0 -z-10 rounded-full bg-white/[0.09] ring-1 ring-white/[0.1]"
												transition={layoutSpring}
											/>
										)}
										<span className="relative font-manrope">{item.label}</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</motion.div>


		</motion.header>
	);
}
