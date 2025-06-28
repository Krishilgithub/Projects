import React from "react";
import {motion} from 'framer-motion'


const LandingPage = () => {
    return (
        <div
            data-scroll
            data-scroll-speed="-0.5"
            className="w-full bg-zinc-900 z-10"
        >
            <div className="textstructure pt-[25vh] px-10 mb-5">
                {["We Create", "Eye Opening", "Presentations"].map(
                    (item, index) => {
                        return (
                            <div className="masker">
                                <div className="w-fit flex items-end overflow-hidden">
                                    {index === 1 && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "8vw" }}
                                            delay={1}
                                            duration={0.8}
                                            transition={{
                                                ease: "linear",
                                            }}
                                            className="flex items-center relative justify-center"
                                        >
                                            <div className="mr-4 w-[8vw] rounded-md h-[5vw] relative inline-block -top-[0.5vw] bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                        </motion.div>
                                    )}
                                    <h1 className="uppercase text-[7.5vw] leading-[6vw] tracking-tighter font-semibold font-['Founders_Grotesk']">
                                        {item}
                                    </h1>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
            <div className="flex justify-between px-10 py-5 border-t-2 mt-20">
                {[
                    "For public and private companies",
                    "From the first pitch to IPO",
                ].map((item, index) => {
                    return <h2 key={index}>{item}</h2>;
                })}
                <button className="uppercase cursor-pointer text-white px-20">
                    Start The Project <span></span>{" "}
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
