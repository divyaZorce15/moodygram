"use client";

import { useState } from "react";
import { ArrowLeft, LocationEditIcon, Star, Tent } from "lucide-react";
import Link from "next/link";

export default function Slider({ property }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">

      {/* Image Section */}
      <div className="relative h-62 w-full overflow-x-hidden rounded-b-[35px]">

        {/* Slider */}
        <div
          onScroll={handleScroll}
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x"
          }}
        >
          {(property.property_images?.length > 0
            ? property.property_images
            : [{ image_url: "/placeholder.jpg" }]
          ).map((img, index) => (
            <div
              key={index}
              className="min-w-full h-full flex-shrink-0 snap-start"
            >
              <img
                src={img.image_url}
                alt="property"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-[5] pointer-events-none" />

        {/* Back button */}
        <div className="absolute top-4 left-0 right-0 px-4 z-10">
          <Link href="/">
            <button className="flex items-center justify-center h-[44px] w-[44px] rounded-full bg-[#D9D9D9] border border-[#C6C6C6]">
              <ArrowLeft size={16} strokeWidth={3} className="text-[#2E4454]" />
            </button>
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-5 left-0 right-0 z-10 px-4 flex items-center justify-between">

          {/* LEFT INFO */}
          <div className="flex items-center gap-3 text-white text-xs">
            <div className="flex items-center gap-2">
              <Star size={12} className="fill-white text-white" />
              <span>4.9</span>
            </div>
            <div className="flex items-center gap-1">
              <Tent size={12} />
              <span>{property.property_category || "Individual Property"}</span>
            </div>
          </div>

          {/* RIGHT DOTS (ACTIVE FIX) */}
          <div className="flex items-center gap-1">
            {(property.property_images || []).map((_, i) => (
              <span
                key={i}
                className={`h-[6px] w-[6px] rounded-full ${
                  i === activeIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>

        </div>

      </div>

      {/* Content */}
      <div className="p-4 flex-1">

        <h1 className="text-lg font-semibold text-center">
          {property.title || "No Title"}
        </h1>

        <p className="text-sm text-[#2E4454] mt-1 flex items-center justify-center gap-1">
          <LocationEditIcon size={13} /> {property.location || "No Location"}
        </p>

        <div className="border-t my-4"></div>

        <p className="text-sm text-[#6C6C6C] text-center">
          4 Guests · 2 Bedrooms · 2 Bathrooms
        </p>

        <div className="border-t my-4"></div>

      </div>

      {/* Bottom Price Section */}
      <div className="p-4 border-t flex items-center justify-between">

        <div>
          <p className="font-semibold text-sm">
            ₹ {property.price_per_night || 0}
          </p>
          <p className="text-xs text-gray-500">
            for {property.duration || "-"}
          </p>
        </div>

        <button className="bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium">
          Check Availability
        </button>

      </div>

    </div>
  );
}