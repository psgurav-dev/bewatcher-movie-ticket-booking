'use client';
import { MdLocalMovies } from 'react-icons/md';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function Navbar() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <motion.div
            className={`w-full p-2 flex items-csenter font-josefin font-bold text-2xl fixed `}
            initial={{ height: 120 }}
            animate={{
                height: scrollY > 80 ? 60 : 120,
                backgroundColor: scrollY > 80 ? 'rgba(40, 36, 36, 0.66)' : 'rgba(40, 36, 36, 0)',
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
            <div className="container mx-auto px-24 flex items-center gap-x-4">
                <Link href={'/'}>
                    <MdLocalMovies size={48} />
                </Link>
                <h2>BeWatcher</h2>
            </div>
        </motion.div>
    );
}

export default Navbar;
