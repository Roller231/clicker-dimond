import { useState, useRef, useCallback } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import AsyncImage from './AsyncImage'

/**
 * Task 3: Updated component to support WebM video backgrounds
 * - By default: show WebM background (or fallback to image)
 * - On hover: hide WebM, show only JSON animation (transparent background)
 * - On mouse leave: WebM background reappears immediately
 */
function HoverLottie({ 
  image, 
  animation, 
  video, // New: WebM video background URL
  alt = 'Gift', 
  imageClassName = '', 
  animationClassName = '',
  videoClassName = '',
  holdDelay = 200 // ms to wait before showing animation on mobile hold
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [shouldLoadAnimation, setShouldLoadAnimation] = useState(false)
  const holdTimerRef = useRef(null)
  const videoRef = useRef(null)
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (animation) {
      setShouldLoadAnimation(true)
    }
  }, [animation])
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    // Keep animation loaded once it's been loaded (caching)
  }, [])
  
  const handleTouchStart = useCallback(() => {
    if (animation) {
      holdTimerRef.current = setTimeout(() => {
        setIsHovered(true)
        setShouldLoadAnimation(true)
      }, holdDelay)
    }
  }, [animation, holdDelay])
  
  const handleTouchEnd = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    setIsHovered(false)
  }, [])
  
  // If no animation, just show image or video
  if (!animation) {
    if (video) {
      return (
        <video
          ref={videoRef}
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className={videoClassName || imageClassName}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )
    }
    return (
      <AsyncImage
        src={image}
        alt={alt}
        className={imageClassName}
      />
    )
  }
  
  return (
    <div 
      className="hover-lottie-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Fix: Static image/video completely HIDDEN (display:none) when JSON animation is active */}
      {video ? (
        <video
          ref={videoRef}
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className={videoClassName || imageClassName}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            display: isHovered && shouldLoadAnimation ? 'none' : 'block',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      ) : (
        /* Fallback to image if no video - completely hidden when JSON plays */
        <AsyncImage
          src={image}
          alt={alt}
          className={imageClassName}
          style={{ 
            display: isHovered && shouldLoadAnimation ? 'none' : 'block'
          }}
        />
      )}
      
      {/* JSON animation - only visible on hover (transparent background) */}
      {shouldLoadAnimation && (
        <Player
          autoplay={isHovered}
          loop
          src={animation}
          className={animationClassName}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.15s ease',
            pointerEvents: 'none',
            background: 'transparent' // Task 3: Ensure transparent background for JSON
          }}
        />
      )}
    </div>
  )
}

export default HoverLottie
