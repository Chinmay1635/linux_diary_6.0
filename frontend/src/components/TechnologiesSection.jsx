import React, { useState, useEffect, useRef } from 'react';

import discordImg from '../assets/technologies/discord.webp';
import figmaImg from '../assets/technologies/figma.webp';
import framerImg from '../assets/technologies/framer.webp';
import notionImg from '../assets/technologies/notion.webp';
import photoshopImg from '../assets/technologies/photoshop.webp';
import protopieImg from '../assets/technologies/protopie.webp';
import raindropImg from '../assets/technologies/raindrop.webp';
import slackImg from '../assets/technologies/slack.webp';

const technologies = [
  { name: 'React', img: discordImg, description: 'Frontend framework', color: '#61DAFB' },
  { name: 'Node.js', img: figmaImg, description: 'Backend runtime', color: '#339933' },
  { name: 'Docker', img: framerImg, description: 'Containerization', color: '#2496ED' },
  { name: 'MongoDB', img: notionImg, description: 'Database', color: '#47A248' },
  { name: 'Python', img: photoshopImg, description: 'Programming language', color: '#3776AB' },
  { name: 'Git', img: protopieImg, description: 'Version control', color: '#F05032' },
  { name: 'AWS', img: raindropImg, description: 'Cloud platform', color: '#FF9900' },
  { name: 'Linux', img: slackImg, description: 'Operating system', color: '#FCC624' }
];

const TechnologiesSection = () => {
  const [currentTechIndex, setCurrentTechIndex] = useState(0);
  const [firingTech, setFiringTech] = useState(null);
  const [cannonballsInFlight, setCannonballsInFlight] = useState([]);
  const [landedTechs, setLandedTechs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cannonRecoil, setCannonRecoil] = useState(false);
  const [screenSize, setScreenSize] = useState('large');
  const [showLandingExplosion, setShowLandingExplosion] = useState(false);
  
  const shipRef = useRef(null);
  const islandRef = useRef(null);
  const animationRef = useRef(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Detect screen size and handle resize for all devices
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setScreenSize('large');
      } else if (width >= 768) {
        setScreenSize('medium');
      } else {
        setScreenSize('small');
      }
    };
    
    const handleResize = () => {
      checkScreenSize();
      // Force recalculation of trajectory for flying cannonballs
      setCannonballsInFlight(prev => [...prev]);
    };
    
    checkScreenSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-fire cannon every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if(landedTechs.length<=7){

        fireCannon();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentTechIndex]);

  // Handle cannonball flight animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCannonballsInFlight(prev => {
        const now = Date.now();
        const flightDuration = 3500;
        const stillFlying = prev.filter(ball => now - ball.startTime < flightDuration);
        const justLanded = prev.filter(ball => now - ball.startTime >= flightDuration);
        
        justLanded.forEach(ball => {
          setLandedTechs(current => {
            if (!current.find(tech => tech.name === ball.tech.name)) {
              // Show explosion when ball lands
              setShowLandingExplosion(true);
              setTimeout(() => setShowLandingExplosion(false), 800);
              return [...current, ball.tech];
            }
            return current;
          });
        });

        return stillFlying;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Animation for revolving tech icons
  useEffect(() => {
    const animate = () => {
      setRotationAngle(prev => (prev + 0.5) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (landedTechs.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [landedTechs.length]);

  const fireCannon = () => {
    const currentTech = technologies[currentTechIndex];
    setFiringTech(currentTech);
    setIsLoading(true);
    setCannonRecoil(true);

    // Calculate fixed trajectory positions relative to container, not viewport
    let startX, startY, endX, endY;
    
    // Use container-relative positioning instead of getBoundingClientRect
    if (screenSize === 'large') {
      startX = 310; // Fixed position relative to container for large screens
      startY = 175;
      endX = window.innerWidth - 500;
      endY = 320;
    } else if (screenSize === 'medium') {
      startX = 220;
      startY = 200;
      endX = window.innerWidth - 400;
      endY = 260;
    } else {
      startX = 125;
      startY = 110;
      endX = window.innerWidth - 140;
      endY = 180;
    }

    const newCannonball = {
      id: Date.now(),
      tech: currentTech,
      startTime: Date.now(),
      // Store fixed trajectory positions (container-relative)
      fixedStartX: startX,
      fixedStartY: startY,
      fixedEndX: endX,
      fixedEndY: endY
    };
    setCannonballsInFlight(prev => [...prev, newCannonball]);

    setTimeout(() => {
      setFiringTech(null);
      setIsLoading(false);
      setCannonRecoil(false);
    }, 800);

    setCurrentTechIndex((prev) => (prev + 1) % technologies.length);
  };

  const resetDemo = () => {
    setLandedTechs([]);
    setCannonballsInFlight([]);
    setCurrentTechIndex(0);
    setShowLandingExplosion(false);
  };

  // Calculate trajectory - completely scroll-independent positioning
  const getCannonballPosition = (progress, ball = null) => {
    let startX, startY, endX, endY;
    
    // Use fixed positions from the ball if available (completely scroll-independent)
    if (ball && ball.fixedStartX !== undefined) {
      startX = ball.fixedStartX;
      startY = ball.fixedStartY;
      endX = ball.fixedEndX;
      endY = ball.fixedEndY;
    } else {
      // Fallback to container-relative positions (not viewport-dependent)
      if (screenSize === 'large') {
        startX = 320;
        startY = 280;
        endX = window.innerWidth - 600;
        endY = 320;
      } else if (screenSize === 'medium') {
        startX = 220;
        startY = 200;
        endX = window.innerWidth - 400;
        endY = 240;
      } else {
        startX = 140;
        startY = 130;
        endX = window.innerWidth - 200;
        endY = 160;
      }
    }
    
    // Calculate current position along the trajectory
    const currentX = startX + (endX - startX) * progress;
    
    // Create responsive arc trajectory
    const distance = Math.abs(endX - startX);
    const baseArcHeight = screenSize === 'large' ? 150 : screenSize === 'medium' ? 100 : 60;
    const dynamicArcHeight = Math.min(distance * 0.2, baseArcHeight);
    const currentY = startY + (endY - startY) * progress - (4 * dynamicArcHeight * progress * (1 - progress));
    
    return { x: currentX, y: currentY };
  };

  // Calculate positions for revolving tech icons - responsive for all devices
  const getTechPosition = (index, total) => {
    let radius;
    if (screenSize === 'large') {
      radius = 260;
    } else if (screenSize === 'medium') {
      radius = 150;
    } else {
      radius = 100;
    }
    
    const angle = (index * (360 / total) + rotationAngle) * (Math.PI / 180);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  return (
    <section className="py-12 md:py-20 relative overflow-hidden min-h-[500px] md:min-h-screen ">
      {/* Ocean Background */}
      <div className="absolute inset-0">
        <div className="enhanced-ocean-waves"></div>
        <div className="enhanced-ocean-surface"></div>
        <div className="ocean-foam"></div>
      </div>

      {/* Floating Clouds */}
      <div className="absolute inset-0 my-10 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <img
            key={i}
            src="/images/clouds.png"
            alt="Cloud"
            className={`absolute transition-all ${screenSize === 'large' ? 'animate-bounce' : 'animate-bounce-sm'} rotate-2`}
            style={{
              width: screenSize === 'large' ? `${150 + i * 10}px` : `${70 + i * 6}px`,
              height: screenSize === 'large' ? `${70 + i * 5}px` : `${30 + i * 3}px`,
              left: screenSize === 'large' ? `${5 + i * 25}%` : `${2 + i * 26}%`,
              top: screenSize === 'large' ? `${5 + (i % 3) * 10}%` : `${2 + (i % 3) * 7}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: screenSize === 'large' ? `${6 + i * 0.5}s` : `${4 + i * 0.3}s`,
              opacity: 0.9
            }}
          />
        ))}
      </div>

        <div className="container mx-auto px-0 relative z-10">
          {/* <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-6">
          ⚓ Pirate Tech Arsenal ⚓
            </h2>
            <p className="text-base md:text-xl text-cyan-200 max-w-3xl mx-auto">
          Watch our pirate penguins launch technologies across the digital seas!
            </p>
          </div> */}

          {/* Main Scene Container */}
        <div className="relative w-full h-[300px] md:h-[500px]  mx-auto">
          
          {/* Pirate Ship */}
          <div 
            ref={shipRef}
            className="absolute left-4 md:left-0 bottom-16 "
          >
            <div className={`relative ${cannonRecoil ? 'animate-recoil' : 'animate-wave'}`}>
              <img 
                src="/images/tux-gun2.png" 
                alt="Pirate Ship"
                className="w-[25vw] md:w-[20vw] lg:w-[20vw] h-auto drop-shadow-2xl transition-all duration-300"
              />
              
              {/* Cannon Fire Effect */}
              {firingTech && (
               
                <div className="absolute right-0  top-1/3 transform -translate-y-1/2 translate-x-1/2">
                  <img 
                    src="/images/explod-animation.gif" 
                    alt="Cannon Explosion"
                    className="w-16 h-16 md:w-48 md:h-48 object-contain z-20"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Flying Cannonballs */}
          {cannonballsInFlight.map((ball) => {
            const progress = Math.min((Date.now() - ball.startTime) / 3000, 1);
            const position = getCannonballPosition(progress, ball);
            const rotation = progress * 720;
            
            return (
              <div
                key={ball.id}
                className="absolute transition-none pointer-events-none z-20"
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  transform: `scale(${1.2 - progress * 0.4}) rotate(${rotation}deg)`
                }}
              >
                <div className="relative">
                  <img 
                    src="/images/cannonball.avif" 
                    alt="Cannonball"
                    className="w-8 h-8 md:w-12 md:h-12 drop-shadow-xl"
                  />
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                      style={{
                        left: `${-4 - i * 2}px`,
                        top: `${3 + i}px`,
                        animationDelay: `${i * 200}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Treasure Island */}
          <div 
            ref={islandRef}
            className="absolute right-5 md:right-16 bottom-16"
          >
            <div className="relative">
              {/* Show explosion only when a cannonball just landed */}
              {showLandingExplosion && (
                <div 
                  className="absolute z-100 transform -translate-y-1/2"
                  style={{
                    left: screenSize === 'large' ? '100px' : screenSize === 'medium' ? '70px' : '50px',
                    top: '50%'
                  }}
                >
                  <img 
                    src="/images/explod-animation.gif" 
                    alt="Landing Explosion"
                    className={`object-contain z-20 ${
                      screenSize === 'large' ? 'w-48 h-48' : 
                      screenSize === 'medium' ? 'w-32 h-32' : 
                      'w-16 h-16'
                    }`}
                  />
                </div>
              )}
              {landedTechs.length <= 7 && (
                <img 
                  src="/images/island.avif" 
                  alt="Treasure Island"
                  className="w-[190px] md:w-[200px] lg:w-[600px] h-auto drop-shadow-2xl"
                />
              )}
              {landedTechs.length > 7 && (
                <img 
                  src="/images/wargame2.avif" 
                  alt="Treasure Island"
                  className="w-[190px] md:w-[200px] lg:w-[600px] h-auto drop-shadow-2xl"
                />
              )}

              {/* Revolving Tech Icons */}
              {landedTechs.length > 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {landedTechs.map((tech, index) => {
                    const position = getTechPosition(index, landedTechs.length);
                    return (
                      <div
                      key={tech.name}
                      className="absolute flex items-center justify-center"
                      style={{
                        transform: `translate(${position.x-10}px, ${position.y-10}px)`,
                        transition: 'transform 1.55s ease-out',
                      }}
                      >
                      <div className="w-8 h-8 md:w-15 md:h-15 bg-gradient-to-br from-white to-gray-400 rounded-xl border-2 border-white flex items-center justify-center text-sm md:text-lg shadow-lg"
                        style={{ animationDelay: `${index * 0.1}s` }}>
                        <img
                        src={tech.img}
                        alt={tech.name}
                        className="w-6 h-6 md:w-10 md:h-10 object-contain"
                        />
                      </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="text-center mt-8 md:mt-16">
          <div className="inline-block p-4 md:p-6 bg-white/0  rounded-xl md:rounded-2xl  ">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 mb-3 md:mb-4">
              <button
                onClick={fireCannon}
                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-sm md:text-base rounded-lg md:rounded-xl shadow-md hover:scale-105 transition-transform duration-200 border-2 border-red-400"
              >
                🔥 Fire Cannon!
              </button>
              
              <button
                onClick={resetDemo}
                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white font-bold text-sm md:text-base rounded-lg md:rounded-xl shadow-md hover:scale-105 transition-transform duration-200 border-2 border-cyan-400"
              >
                🔄 Reset Fleet
              </button>
            </div>
            
            {/* <div className="text-amber-100 text-sm md:text-base">
              <p className="font-bold mb-1 md:mb-2">⚓ Captain's Log ⚓</p>
              <p className="mb-1">
                Technologies Captured: <span className="text-yellow-300 font-bold">{landedTechs.length}/{technologies.length}</span>
              </p>
              <p>
                Next Ammunition: <span className="text-yellow-300 font-bold">{technologies[currentTechIndex]?.name || 'Reloading...'}</span>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologiesSection;