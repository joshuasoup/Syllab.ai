import { useState } from 'react';
import '@styles/LogoMarquee.css';

const logoUrls = [
  {
    src: "https://carleton.ca/brand/wp-content/uploads/brand-logo-800w-1.jpg",
    alt: "Carleton University"
  },
  {
    src: "https://lirp.cdn-website.com/f0336780/dms3rep/multi/opt/uottawa_hor_black-p-500-640w.png",
    alt: "University of Ottawa"
  },
  {
    src: "https://www.diglib.org/wp-content/uploads/sites/3/2014/12/UofT_Logo.svg_-e1418677958967.png",
    alt: "University of Toronto"
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/McMaster_University_logo.svg/1200px-McMaster_University_logo.svg.png",
    alt: "McMaster University"
  },
  {
    src: "https://uwaterloo.ca/brand/sites/ca.brand/files/styles/body-500px-wide/public/uploads/images/universityofwaterloo_logo_horiz_rgb_1.jpg?itok=1aKXR4xp",
    alt: "University of Waterloo"
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGmlerYx47Ga8nsyQrlxxn_vjmxWrfHqbb8w&s",
    alt: "Queen's University"
  },
  {
    src: "https://educationontario.com/app/uploads/2022/04/Western_Logo_RGB.jpg",
    alt: "Western University"
  }
];

export const LogoMarquee = () => {
  const [isPaused, setIsPaused] = useState(false);

  const renderLogoGroup = () => (
    <div className="logo-group flex items-center bg-white">
      {logoUrls.map((logo, index) => (
        <img
          key={index}
          src={logo.src}
          alt={logo.alt}
          className="h-12 w-48 min-w-48 object-contain mx-6 logo-item flex-shrink-0"
        />
      ))}
    </div>
  );

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      className="marquee-container w-full overflow-hidden py-3 px-4 flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        
        backgroundSize: "cover, 25px 25px, 25px 25px",
      }}
    >
      <div className={`logo-track flex items-center whitespace-nowrap ${isPaused ? 'paused' : 'playing'}`}>
        {renderLogoGroup()}
        {renderLogoGroup()}
        {renderLogoGroup()}
      </div>
    </div>
  );
}; 