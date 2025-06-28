import React from "react";
import { motion, useAnimation } from "framer-motion";

const Featured = () => {
    // Using two separate animation controls for each card
    const cards = [useAnimation(), useAnimation()];

    // Handle hover effect to start animation
    const handleHover = (index) => {
        cards[index].start({ y: "0%" }); // Animate text back to view on hover
    };

    const handleHoverEnd = (index) => {
        cards[index].start({ y: "100%" }); // Animate text off view when hover ends
    };

    return (
        <div
        data-scroll
        data-scroll-speed="-.08"
         className="w-full py-20">
            <div className="w-full px-20 border-b-[1px] border-zinc-700 pb-20">
                <h1 className="text-8xl font-['Neue_Montreal']">
                    Featured Projects
                </h1>
            </div>
            <div className="px-20">
                <div className="cards w-full flex gap-10 mt-10">
                    {/* First Card */}
                    <motion.div
                        onHoverStart={() => handleHover(0)}
                        onHoverEnd={() => handleHoverEnd(0)}
                        className="relative cardcontainer w-1/2 h-[75vh]"
                    >
                        <h1 className="absolute left-full top-1/2 -translate-y-1/2 -translate-x-[50%] z-[9] leading-none tracking-tighter text-8xl flex overflow-hidden">
                            {"FYDE".split("").map((item, index) => {
                                return (
                                    <motion.span
                                        key={index} // Added key prop to avoid warnings
                                        initial={{ y: "100%" }}
                                        animate={cards[0]}
                                        transition={{
                                            ease: [0.76, 0, 0.24, 1],
                                            delay: index * 0.06,
                                        }}
                                        className="inline-block"
                                    >
                                        {item}
                                    </motion.span>
                                );
                            })}
                        </h1>
                        <div className="card w-full h-full rounded-xl bg-green-600">
                            <img
                                className="w-full h-full bg-cover"
                                src="https://ochi.design/wp-content/uploads/2024/08/CS_Website_1-663x551.png"
                                alt="FYDE Project"
                            />
                        </div>
                    </motion.div>

                    {/* Second Card */}
                    <motion.div
                        onHoverStart={() => handleHover(1)}
                        onHoverEnd={() => handleHoverEnd(1)}
                        className="relative cardcontainer w-1/2 h-[75vh]"
                    >
                        <h1 className="absolute right-full top-1/2 -translate-y-1/2 translate-x-[50%] z-[9] leading-none tracking-tighter text-8xl flex overflow-hidden">
                            {"VISE".split("").map((item, index) => {
                                return (
                                    <motion.span
                                        key={index} // Added key prop
                                        initial={{ y: "100%" }}
                                        animate={cards[1]}
                                        transition={{
                                            ease: [0.76, 0, 0.24, 1],
                                            delay: index * 0.06,
                                        }}
                                        className="inline-block"
                                    >
                                        {item}
                                    </motion.span>
                                );
                            })}
                        </h1>
                        <div className="card w-full h-full rounded-xl bg-green-600">
                            <img
                                className="w-full h-full bg-cover"
                                src="https://ochi.design/wp-content/uploads/2024/08/Frame-481692-1-663x551.png"
                                alt="VISE Project"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Featured;
