'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Camera, Sliders, Sun, Moon, Cloud, Triangle, Droplet, RefreshCw, Share2, Info, Upload, Archive } from 'lucide-react'
import { Caesar_Dressing } from 'next/font/google'

const caesarDressing = Caesar_Dressing({ 
  weight: '400',
  subsets: ['latin'],
})

const logoStyle = {
  fontFamily: caesarDressing.style.fontFamily,
  fontWeight: 400,
  fontStyle: 'normal'
}

const cameraEffects = [
  { name: 'Vivid', icon: Sun, values: { brightness: 20, contrast: 10 } },
  { name: 'Warm', icon: Cloud, values: { temperature: 10, brightness: 5 } },
  { name: 'Virosauda', icon: Droplet, values: {} },
  { name: 'Cool', icon: Moon, values: { temperature: -10, brightness: 5 } },
  { name: 'Vintage', icon: Camera, values: { sepia: 30, contrast: 10, brightness: -10 } },
]

const advancedSettings = [
  { name: 'brightness', icon: Sun, min: -100, max: 100 },
  { name: 'contrast', icon: Triangle, min: -100, max: 100 },
  { name: 'saturation', icon: Droplet, min: -100, max: 100 },
  { name: 'temperature', icon: Cloud, min: -100, max: 100 },
  { name: 'tint', icon: Moon, min: -100, max: 100 },
  { name: 'sharpness', icon: Triangle, min: 0, max: 100 },
]

export default function Component() {
  const [image, setImage] = useState<string | null>(null)
  const [activeEffect, setActiveEffect] = useState('Virosauda')
  const [settings, setSettings] = useState<Record<string, number>>({})
  const [darkMode, setDarkMode] = useState(true)
  const [storedImages, setStoredImages] = useState<string[]>([])
  const [activeSetting, setActiveSetting] = useState('brightness')
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const initialSettings = advancedSettings.reduce((acc, setting) => {
      acc[setting.name] = 0
      return acc
    }, {} as Record<string, number>)
    setSettings(initialSettings)
  }, [])

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

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
      const imageDataUrl = canvas.toDataURL('image/jpeg')
      setImage(imageDataUrl)
      storeImage(imageDataUrl)
    }
  }

  const storeImage = (imageDataUrl: string) => {
    setStoredImages(prev => {
      const newStoredImages = [imageDataUrl, ...prev.slice(0, 2)]
      console.log('Saving image to Virosauda folder in camera roll')
      return newStoredImages
    })
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing the camera", err)
    }
  }

  const refreshCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    startCamera()
  }

  useEffect(() => {
    startCamera()
  }, [])

  const applyEffects = () => {
    if (canvasRef.current && image) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          const activeEffectValues = cameraEffects.find(f => f.name === activeEffect)?.values || {}
          const appliedSettings = { ...settings, ...activeEffectValues }

          for (let i = 0; i < data.length; i += 4) {
            data[i] += appliedSettings.brightness * 2.55
            data[i + 1] += appliedSettings.brightness * 2.55
            data[i + 2] += appliedSettings.brightness * 2.55

            for (let j = 0; j < 3; j++) {
              data[i + j] = ((data[i + j] / 255 - 0.5) * (appliedSettings.contrast / 100 + 1) + 0.5) * 255
            }

            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
            data[i] += (data[i] - avg) * (appliedSettings.saturation / 100)
            data[i + 1] += (data[i + 1] - avg) * (appliedSettings.saturation / 100)
            data[i + 2] += (data[i + 2] - avg) * (appliedSettings.saturation / 100)

            for (let j = 0; j < 3; j++) {
              data[i + j] = Math.max(0, Math.min(255, data[i + j]))
            }
          }

          ctx.putImageData(imageData, 0, 0)
        }
        img.src = image
      }
    }
  }

  useEffect(() => {
    applyEffects()
  }, [image, activeEffect, settings])

  const handleSettingChange = (settingName: string, value: number) => {
    setSettings(prev => ({ ...prev, [settingName]: value }))
  }

  const shareImage = () => {
    if (navigator.share && canvasRef.current) {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "virosauda_image.jpg", { type: "image/jpeg" })
          try {
            await navigator.share({
              files: [file],
              title: 'Virosauda Image',
              text: 'Check out this image I created with Virosauda!',
            })
          } catch (error) {
            console.error('Error sharing:', error)
          }
        }
      }, 'image/jpeg')
    } else {
      console.log('Web Share API not supported')
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-[#F5E6D3] text-gray-800'} flex flex-col`}>
      <div className="flex-1 relative">
        {image ? (
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        )}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-4 left-4 right-4 flex justify-between items-center"
        >
          <h1 className={`text-3xl ${caesarDressing.className}`} style={logoStyle}>Virosauda</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setDarkMode(!darkMode)}
            className="transition-colors duration-300"
          >
            {darkMode ? <Sun className="h-6 w-6 text-orange-500" /> : <Moon className="h-6 w-6 text-[#8B4513]" />}
          </Button>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4"
        >
          <AnimatePresence>
            {showAdvancedSettings && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 bg-black bg-opacity-70 rounded-lg p-4"
              >
                <h3 className="text-white text-lg mb-2">{activeSetting}</h3>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[settings[activeSetting] || 0]}
                  onValueChange={(val) => handleSettingChange(activeSetting, val[0])}
                  className="mb-4"
                />
                <div className="flex justify-between">
                  {advancedSettings.map((setting) => (
                    <Button
                      key={setting.name}
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveSetting(setting.name)}
                      className={`rounded-full ${activeSetting === setting.name ? 'bg-white bg-opacity-20' : ''}`}
                    >
                      <setting.icon className="h-6 w-6 text-white" />
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-center items-center mb-4 overflow-x-auto py-2">
            {cameraEffects.map((effect) => (
              <motion.button
                key={effect.name}
                whileTap={{ scale: 0.95 }}
                className={`rounded-full overflow-hidden mx-2 ${activeEffect === effect.name ? 'ring-2 ring-orange-500' : ''}`}
                onClick={() => setActiveEffect(effect.name)}
              >
                <div className={`w-14 h-14 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'} flex items-center justify-center transition-colors duration-300`}>
                  <effect.icon className={`h-8 w-8 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
                </div>
                <span className="sr-only">{effect.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${darkMode ? 'bg-gray-900' : 'bg-[#D2B48C]'} p-4 flex justify-center items-center transition-colors duration-300 relative`}
      >
        <div className="absolute left-4 flex space-x-2">
          <Button variant="ghost" size="icon" onClick={refreshCamera}>
            <RefreshCw className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={shareImage}>
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`w-20 h-20 rounded-full ${darkMode ? 'bg-orange-500' : 'bg-[#8B4513]'} flex items-center justify-center transition-colors duration-300`}
          onClick={capturePhoto}
        >
          <Camera className="h-10 w-10 text-white" />
        </motion.button>
        <div className="absolute right-4 flex space-x-2">
          <Button variant="ghost" size="icon" onClick={triggerImageUpload}>
            <Upload className="h-6 w-6" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className={`w-80 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} transition-colors duration-300`}>
              <div className="grid gap-4">
                <h3 className="font-medium leading-none">About Virosauda</h3>
                <p>Virosauda is an innovative camera app created by Tehillah Kachila and Stanley. It aims to provide a unique and powerful photography experience.</p>
                <p>Our goal is to make professional-grade photography accessible to everyone, combining ease of use with powerful features.</p>
                <p className="text-xs mt-4">© 2024 Virosauda Inc. All rights reserved. 
                The Virosauda name, logo, and all associated intellectual property belong to Tehillah Kachila and Stanley under Virosauda Inc.</p>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className={`${showAdvancedSettings ? (darkMode  ? 'text-orange-500' : 'text-[#8B4513]') : ''} transition-colors duration-300`}
          >
            <Sliders className="h-6 w-6" />
          </Button>
        </div>
      </motion.div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="image-upload"
        ref={fileInputRef}
      />
    </div>
  )
}