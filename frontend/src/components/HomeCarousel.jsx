import React, { useState, useEffect } from "react";
import "./HomeCarousel.css";

const images = [
  require("../assets/home/home1.jpg"),
  require("../assets/home/home2.jpg"),
  require("../assets/home/home3.jpg"),
];

const HomeCarousel = () => {
  const [index, setIndex] = useState(0);

  // Auto slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="carousel-container">
      <img src={images[index]} className="carousel-image" alt="banner" />

      <button className="carousel-btn left" onClick={prevSlide}>
        ❮
      </button>
      <button className="carousel-btn right" onClick={nextSlide}>
        ❯
      </button>

      <div className="carousel-dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default HomeCarousel;
