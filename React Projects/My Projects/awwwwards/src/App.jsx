import React from 'react'
import Hero from "./components/Hero.jsx";

function App (){
    return (
       <main className="w-screen min-h-screen overflow-x-hidden relative">
           <Hero />
           {/*<video src="videos/hero-1.mp4" autoPlay loop muted className="z-50 size-full" />*/}
       </main>
    )
}

export default App;