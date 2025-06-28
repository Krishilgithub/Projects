import React, { useState, useEffect } from "react";

const Eyes = () => {
    const [rotate, setRotate] = useState(0);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            let mouseX = e.clientX;
            let mouseY = e.clientY;

            let deltaX = mouseX - window.innerWidth / 2;
            let deltaY = mouseY - window.innerHeight / 2;

            // Calculate the rotation angle for the inner black div
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            setRotate(angle - 180);

            // Set the translation for the outer eye div
            setTranslate({
                x: deltaX * 0.02, // Adjust this multiplier for desired effect
                y: deltaY * 0.02,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div
            data-scroll
            data-scroll-speed="-.05"
            className="eyes w-full h-screen overflow-hidden"
        >
            <div className="relative w-full h-full bg-cover bg-center bg-[url('https://ochi.design/wp-content/uploads/2022/05/Top-Viewbbcbv-1-1440x921.jpg')]">
                <div className="absolute flex gap-10 top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] px-10 w-1/2 h-96 items-center justify-between">
                    {/* Left Eye */}
                    <div
                        className="flex items-center justify-center rounded-full bg-zinc-200 h-[15vw] w-[15vw]"
                        style={{
                            transform: `translate(${translate.x}px, ${translate.y}px)`, // Apply translation to outer div
                        }}
                    >
                        <div className="relative rounded-full w-2/3 h-2/3 bg-zinc-900 ">
                            <div
                                style={{
                                    transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                                }}
                                className="line absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] w-full h-10"
                            >
                                <div className="w-10 h-10 rounded-full bg-zinc-100"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Eye */}
                    <div
                        className="flex items-center justify-center rounded-full bg-zinc-200 h-[15vw] w-[15vw]"
                        style={{
                            transform: `translate(${translate.x}px, ${translate.y}px)`, // Apply translation to outer div
                        }}
                    >
                        <div className="relative rounded-full w-2/3 h-2/3 bg-zinc-900 ">
                            <div
                                style={{
                                    transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                                }}
                                className="line absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] w-full h-10"
                            >
                                <div className="w-10 h-10 rounded-full bg-zinc-100"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Eyes;
