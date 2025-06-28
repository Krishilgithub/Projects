import React from 'react'
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Navbar from "./components/Navbar.jsx";
import Features from "./components/Features.jsx";
import Story from "./components/Story.jsx";
import Footer from "./components/Footer.jsx";

const App = () => {
    return (
        <div className="relative overflow-x-hidden min-h-screen w-screen">
            <Navbar />
            <Hero />
            <About />
            <Features />
            <Story />
            <Footer />
        </div>
    )
}
export default App
