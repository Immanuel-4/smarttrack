import { useRef, useState, useEffect, Children, cloneElement } from 'react'
import { ChevronUp } from 'lucide-react'

export default function BottomSheet({ children, minHeight = 120, maxHeight = '80vh' }) {
  const sheetRef = useRef(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)

  const handleTouchStart = (e) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const deltaY = e.touches[0].clientY - startY
    setCurrentY(e.touches[0].clientY)
    
    // Visual feedback during drag
    if (sheetRef.current) {
      const transform = Math.max(0, Math.min(deltaY, 200))
      sheetRef.current.style.transform = `translateY(${transform}px)`
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const deltaY = currentY - startY
    
    // Determine snap position based on drag distance
    if (deltaY < -50) {
      // Swiped up - expand
      setIsExpanded(true)
    } else if (deltaY > 50) {
      // Swiped down - collapse
      setIsExpanded(false)
    }
    
    // Reset transform
    if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartY(e.clientY)
    setCurrentY(e.clientY)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const deltaY = e.clientY - startY
    setCurrentY(e.clientY)
    
    if (sheetRef.current) {
      const transform = Math.max(0, Math.min(deltaY, 200))
      sheetRef.current.style.transform = `translateY(${transform}px)`
    }
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const deltaY = currentY - startY
    
    if (deltaY < -50) {
      setIsExpanded(true)
    } else if (deltaY > 50) {
      setIsExpanded(false)
    }
    
    if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 shadow-2xl">
      {/* Drag Handle */}
      <div
        className="flex justify-center py-3 cursor-grab active:cursor-grabbing select-none touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={handleToggle}
      >
        <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
      </div>

      {/* Content */}
      <div
        ref={sheetRef}
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isExpanded ? 'max-h-[80vh]' : `max-h-[${minHeight}px]`
        }`}
        style={{
          maxHeight: isExpanded ? maxHeight : `${minHeight}px`,
        }}
      >
        <div className="px-4 pb-4">
          {Children.map(children, (child) =>
            cloneElement(child, { isExpanded, onToggle: handleToggle })
          )}
        </div>
      </div>

      {/* Expand/Collapse Indicator */}
      <div className="absolute right-4 top-3">
        <ChevronUp
          size={20}
          className={`text-zinc-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </div>
    </div>
  )
}
