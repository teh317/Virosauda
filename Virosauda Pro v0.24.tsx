'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Camera, 
  Cloud,
  Sun, 
  Moon, 
  Triangle,
  Droplet,
  Search,
  Timer,
  Lock,
  Zap,
  ImagePlus,
  RotateCcw,
  Settings,
  Grid,
  Palette,
  Info,
  Aperture,
  Gauge,
  Focus,
  Sliders,
  Clock,
  X
} from 'lucide-react'
import { Caesar_Dressing } from 'next/font/google'
import { cn } from '@/lib/utils'

const caesarDressing = Caesar_Dressing({ 
  weight: '400',
  subsets: ['latin'],
})

interface CameraSetting {
  icon: React.ElementType
  label: string
  value: number
  min: number
  max: number
  step: number
  format?: (value: number) => string
}

const cameraSettings: CameraSetting[] = [
  { icon: Cloud, label: 'Weather Compensation', value: 0, min: -100, max: 100, step: 1 },
  { icon: Triangle, label: 'Highlights', value: 0, min: -100, max: 100, step: 1 },
  { icon: Sun, label: 'Brightness', value: 0, min: -100, max: 100, step: 1 },
  { icon: Moon, label: 'Shadows', value: 0, min: -100, max: 100, step: 1 },
  { icon: Droplet, label: 'Saturation', value: 0, min: -100, max: 100, step: 1 },
  { icon: Search, label: 'Sharpness', value: 0, min: -100, max: 100, step: 1 }
]

const advancedSettings: CameraSetting[] = [
  { icon: Gauge, label: 'ISO', min: 100, max: 6400, value: 800, step: 100 },
  { icon: Timer, label: 'Shutter', min: 1, max: 1000, value: 100, step: 1, format: (v: number) => `1/${v}` },
  { icon: Aperture, label: 'Aperture', min: 1.8, max: 16, value: 5.6, step: 0.1, format: (v: number) => `f/${v.toFixed(1)}` },
  { icon: Focus, label: 'Focus', min: 0.3, max: 100, value: 30, step: 0.1, format: (v: number) => `${v.toFixed(1)}m` },
]

const colorThemes = [
  { name: 'Dark Leather', primary: '#5C4033', secondary: '#8B4513' },
  { name: 'Monochrome', primary: '#FFFFFF', secondary: '#000000' },
  { name: 'Ocean', primary: '#33C7FF', secondary: '#3357FF' },
  { name: 'Sunset', primary: '#FF8333', secondary: '#FF3357' },
]

const gridOptions = [
  { name: 'Rule of Thirds', value: 'thirds' },
  { name: 'Square', value: 'square' },
  { name: 'None', value: 'none' },
]

export default function Component() {
  const [image, setImage] = useState<string | null>(null)
  const [activeTheme, setActiveTheme] = useState(colorThemes[0])
  const [storedImages, setStoredImages] = useState<string[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [flashMode, setFlashMode] = useState<'auto' | 'on' | 'off'>('auto')
  const [focalLength, setFocalLength] = useState(77)
  const [gridType, setGridType] = useState<string>('thirds')
  const [showSettings, setShowSettings] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [activeSetting, setActiveSetting] = useState<string>('Brightness')
  const [cameraSettingsValues, setCameraSettingsValues] = useState<Record<string, number>>(
    cameraSettings.reduce((acc, setting) => ({ ...acc, [setting.label]: setting.value }), {})
  )
  const [advancedSettingsValues, setAdvancedSettingsValues] = useState<Record<string, number>>(
    advancedSettings.reduce((acc, setting) => ({ ...acc, [setting.label]: setting.value }), {})
  )
  const [timerDuration, setTimerDuration] = useState(0)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    startCamera()
    const handleResize = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      console.error("Error accessing the camera", err)
    }
  }

  const SettingsPanel = ({ title, icon: Icon, children, onClose }) => (
    <div className={cn(
      "absolute bg-black/90 backdrop-blur-sm p-6 space-y-6",
      orientation === 'portrait' ? "bottom-0 left-0 right-0" : "top-0 left-0 bottom-0 w-80"
    )}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-white/80">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      {children}
    </div>
  )

  const CameraSettingsPanel = () => (
    <SettingsPanel title="Camera Settings" icon={Camera} onClose={() => setShowSettings(false)}>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm text-white/80">
          <span>{activeSetting}</span>
          <span>{cameraSettingsValues[activeSetting]}</span>
        </div>
        <Slider
          value={[cameraSettingsValues[activeSetting] || 0]}
          min={-100}
          max={100}
          step={1}
          onValueChange={(value) => {
            setCameraSettingsValues(prev => ({
              ...prev,
              [activeSetting]: value[0]
            }))
          }}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0
                     [&_[role=slider]]:shadow-lg [&_track]:h-0.5 [&_track]:bg-white/30 [&_range]:bg-white"
        />
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2">
        {cameraSettings.map((setting) => (
          <Button
            key={setting.label}
            variant="ghost"
            size="icon"
            onClick={() => setActiveSetting(setting.label)}
            className={cn(
              "rounded-full w-12 h-12",
              "hover:bg-white/10",
              activeSetting === setting.label && "bg-white/10"
            )}
          >
            <setting.icon className={cn(
              "h-6 w-6",
              activeSetting === setting.label ? "text-white" : "text-white/60"
            )} />
          </Button>
        ))}
      </div>
    </SettingsPanel>
  )

  const TimerPanel = () => (
    <SettingsPanel title="Timer" icon={Clock} onClose={() => setShowTimer(false)}>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm text-white/80">
          <span>Duration</span>
          <span>{timerDuration}s</span>
        </div>
        <Slider
          value={[timerDuration]}
          min={0}
          max={10}
          step={1}
          onValueChange={(v) => setTimerDuration(v[0])}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0
                     [&_[role=slider]]:shadow-lg [&_track]:h-0.5 [&_track]:bg-white/30 [&_range]:bg-white"
        />
      </div>
    </SettingsPanel>
  )

  const ProSettingsPanel = () => (
    <SettingsPanel title="Professional Settings" icon={Sliders} onClose={() => setShowAdvancedSettings(false)}>
      <div className="space-y-6">
        {advancedSettings.map((setting) => (
          <div key={setting.label} className="space-y-2">
            <div className="flex justify-between items-center text-sm text-white/80">
              <span>{setting.label}</span>
              <span>{setting.format ? setting.format(advancedSettingsValues[setting.label]) : advancedSettingsValues[setting.label]}</span>
            </div>
            <Slider
              value={[advancedSettingsValues[setting.label]]}
              min={setting.min}
              max={setting.max}
              step={setting.step}
              onValueChange={(v) => {
                setAdvancedSettingsValues(prev => ({
                  ...prev,
                  [setting.label]: v[0]
                }))
              }}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0
                         [&_[role=slider]]:shadow-lg [&_track]:h-0.5 [&_track]:bg-white/30 [&_range]:bg-white"
            />
          </div>
        ))}
      </div>
    </SettingsPanel>
  )

  const GridPanel = () => (
    <SettingsPanel title="Grid Type" icon={Grid} onClose={() => setShowGrid(false)}>
      <div className="grid grid-cols-2 gap-2">
        {gridOptions.map((option) => (
          <Button
            key={option.value}
            variant={gridType === option.value ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setGridType(option.value)}
          >
            {option.name}
          </Button>
        ))}
      </div>
    </SettingsPanel>
  )

  const GridOverlay = () => {
    switch (gridType) {
      case 'thirds':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )
      case 'square':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-2 grid-rows-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
      const imageDataUrl = canvas.toDataURL('image/jpeg')
      setImage(imageDataUrl)
      setStoredImages(prev => [imageDataUrl, ...prev.slice(0, 35)]) // Store up to 36 images
    }
  }

  const handleCaptureClick = () => {
    if (timerDuration > 0) {
      let countdown = timerDuration
      const timerInterval = setInterval(() => {
        countdown--
        if (countdown === 0) {
          clearInterval(timerInterval)
          capturePhoto()
        }
      }, 1000)
    } else {
      capturePhoto()
    }
  }

  const ControlButton = ({ icon: Icon, label, onClick, isActive = false }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "relative group",
        isActive && "text-white",
        !isActive && "text-white/60"
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="sr-only">{label}</span>
    </Button>
  )

  return (
    <div className="min-h-screen relative bg-black text-white">
      <div className={cn(
        "relative h-screen flex",
        orientation === 'landscape' ? "flex-row" : "flex-col"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center p-4 z-10",
          orientation === 'landscape' ? "absolute top-0 left-0 right-0 justify-between" : "justify-between"
        )}>
          <h1 className={`text-3xl ${caesarDressing.className} text-center`} style={{ color: activeTheme.primary }}>Virosauda Pro</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <h3 className="font-bold">About Virosauda Pro</h3>
                <p>Virosauda Pro is an advanced camera app created by Tehillah Kachila and Stanley. It combines professional-grade features with an intuitive interface.</p>
                <p>© 2024 Virosauda Inc. All rights reserved.</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="relative flex-1">
          {image ? (
            <img src={image} className="w-full h-full object-cover" alt="Captured" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}
          
          <GridOverlay />
          
          {/* Camera Info Overlay */}
          <div className={cn(
            "absolute left-4 right-4 flex justify-between items-start text-xs font-mono bg-black/50 p-2 rounded-lg",
            orientation === 'landscape' ? "top-16" : "top-4"
          )}>
            <div className="space-y-1">
              <div>RAW+J 4:3</div>
              <div>{focalLength}MM</div>
            </div>
            <div className="space-y-1 text-center">
              <div>ISO {advancedSettingsValues['ISO'] ?? 'N/A'}</div>
              <div>
                {advancedSettings.find(s => s.label === 'Aperture')?.format?.(advancedSettingsValues['Aperture']) ?? 'N/A'}{' '}
                {advancedSettings.find(s => s.label === 'Shutter')?.format?.(advancedSettingsValues['Shutter']) ?? 'N/A'}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div>{gridType !== 'none' ? gridType.charAt(0).toUpperCase() + gridType.slice(1) : 'No Grid'}</div>
              <div>{flashMode.charAt(0).toUpperCase() + flashMode.slice(1)} Flash</div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className={cn(
          "p-4 space-y-4 bg-gradient-to-t from-black/90 to-transparent",
          orientation === 'landscape' 
            ? "fixed bottom-0 left-0 right-0 flex justify-between items-center" 
            : "fixed bottom-0 left-0 right-0 pt-20"
        )}>
          {/* Primary Controls */}
          <div className={cn(
            "flex items-center",
            orientation === 'landscape' ? "space-x-6" : "justify-between"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFlashMode(m => m === 'auto' ? 'on' : m === 'on' ? 'off' : 'auto')}
            >
              <Zap className={cn(
                "h-6 w-6",
                flashMode === 'on' && "text-yellow-400",
                flashMode === 'auto' && "text-blue-400"
              )} />
            </Button>
            
            <ControlButton
              icon={Timer}
              label="Timer"
              onClick={() => setShowTimer(!showTimer)}
              isActive={showTimer}
            />
            <ControlButton
              icon={Grid}
              label="Grid"
              onClick={() => setShowGrid(!showGrid)}
              isActive={showGrid}
            />
            <ControlButton
              icon={Lock}
              label="Lock"
              onClick={() => setIsLocked(!isLocked)}
              isActive={isLocked}
            />
            <ControlButton
              icon={Sliders}
              label="Pro Settings"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              isActive={showAdvancedSettings}
            />
            
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-6 w-6" />
            </Button>
          </div>

          {/* Capture Controls */}
          <div className={cn(
            "flex items-center",
            orientation === 'landscape' ? "space-x-6" : "justify-between"
          )}>
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus className="h-6 w-6" />
            </Button>
            
            <Button
              className={cn(
                "w-16 h-16 rounded-full",
                "bg-gradient-to-r",
              )}
              style={{
                backgroundImage: `linear-gradient(to right, ${activeTheme.primary}, ${activeTheme.secondary})`,
              }}
              onClick={handleCaptureClick}
            >
              <Camera className="h-8 w-8 text-white" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <h3 className="font-bold">Recent Photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {storedImages.slice(0, 9).map((img, index) => (
                      <img key={index} src={img} className="w-full h-20 object-cover rounded" alt={`Recent ${index + 1}`} />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      {showTimer && <TimerPanel />}
      {showGrid && <GridPanel />}
      {showAdvancedSettings && <ProSettingsPanel />}
      {showSettings && <CameraSettingsPanel />}
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        ref={fileInputRef}
      />
    </div>
  )
}