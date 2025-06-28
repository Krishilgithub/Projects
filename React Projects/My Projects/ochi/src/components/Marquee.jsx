import React from "react";
import { motion } from "framer-motion";

const Marquee = () => {
    return (
        <div
            data-scroll
            data-scroll-speed="-0.1"
            className="w-full py-10 bg-[#004D43] mt-10 rounded-t-3xl overflow-hidden"
        >
            <div className="text border-t-2 border-zinc-300 flex">
                <motion.h1
                    initial={{ x: "0" }}
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="uppercase text-[15vw] font-semibold leading-none tracking-tight font-['Founder_Grotesk_X-Condensed'] whitespace-nowrap pr-20"
                >
                    We are Ochi
                </motion.h1>

                <motion.h1
                    initial={{ x: "0" }}
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="uppercase text-[15vw] font-semibold leading-none tracking-tight font-['Founder_Grotesk_X-Condensed'] whitespace-nowrap pr-20 "
                >
                    We are Ochi
                </motion.h1>
            </div>
        </div>
    );
};

const ImageGrid = () => {
    const images = [
        "image1.jpg",
        "image2.jpg",
        "image3.jpg",
        "image4.jpg",
        "image5.jpg",
        "image6.jpg",
        "image7.jpg",
        "image8.jpg",
        "image9.jpg",
        "image10.jpg",
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
                <div
                    key={index}
                    style={{
                        "--r": Math.floor(index / 2) + 1,
                        "--c": (index % 2) + 1,
                    }}
                    className="relative"
                >
                    <img src={image} alt={`Image ${index + 1}`} className="w-full h-auto" />
                </div>
            ))}
        </div>
    );
};

export { ImageGrid };

export default Marquee;
