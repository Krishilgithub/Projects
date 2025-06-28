import React from 'react'
import { ImWhatsapp } from "react-icons/im";
import { FaFacebook, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
      <div className="footer w-full h-screen bg-zinc-900 px-10 py-10">
          <div className="w-full container flex gap-14 relative">
              <div className="w-1/2 mt-4">
                  <h1 className="uppercase text-[7vw] leading-[7.5rem] tracking-tighter font-bold font-['Neue_Montreal]">
                      Eye- Opening
                  </h1>
              </div>
              <div className="w-1/2 mt-4">
                  <h1 className="uppercase text-[7vw] leading-[7.5rem] tracking-tighter font-bold font-['Neue_Montreal] whitespace-nowrap">
                      Presentation
                  </h1>
                  <h4 className="text-[2.5vw] flex gap-5  items-center capitalize text-semibold mt-[10.5vw]">
                      <FaInstagram />
                      Instagram
                  </h4>
                  <h4 className="text-[2.5vw] flex gap-5  items-center capitalize text-semibold">
                      <FaFacebook /> Facebook
                  </h4>
                  <h4 className="text-[2.5vw] flex gap-5  items-center capitalize text-semibold">
                      <ImWhatsapp /> Whatsapp
                  </h4>
              </div>
              <div className="absolute b-0 l-0">ochi</div>
          </div>
      </div>
  );
}

export default Footer