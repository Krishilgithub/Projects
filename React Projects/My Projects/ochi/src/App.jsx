import React from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Eyes from "./components/Eyes";
import Featured from "./components/Featured";
import LocomotiveScroll from "locomotive-scroll";
import Footer from "./components/Footer";

const App = () => {

    const locomotiveScroll = new LocomotiveScroll();

    return (
      <main data-scroll-container className="bg-zinc-900 text-white">
        <Navbar />
        <LandingPage />
        <Marquee />
        <About />
        <Eyes />
        <Featured />
        <Footer />
      </main>
    );
};

export default App;
