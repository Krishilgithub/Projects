import React from "react";

const About = () => {
    return (
        <div
            // data-scroll
            // data-scroll-speed="-.3"
            className="w-full p-20 bg-[#CDEA68] rounded-t-3xl text-black"
        >
            <h1 className="font-['Neue_Montreal] text-[4vw] leading-[4.5vw] tracking-tight">
                Ochi is a strategic presentation agency for forward-thinking
                businesses that need to raise funds, sell products, explain
                complex ideas, and hire great people.
            </h1>

            <div className="w-full flex pt-20 border-t-[1px] mt-20 border-[#a1b562]">
                <div className="w-1/2">
                    <h1 className="text-6xl">Our Approach</h1>
                    <button className="px-10 py-3 mt-5 bg-zinc-900 rounded-full text-white">
                        Read More
                    </button>
                </div>
                <div className="w-1/2 h-[70vh] rounded-3xl bg-[#b0c859]">
                    <img
                        src="https://ochi.design/wp-content/uploads/2022/05/Homepage-Photo-663x469.jpg"
                        alt=""
                    />
                </div>
            </div>
        </div>
    );
};

export default About;
