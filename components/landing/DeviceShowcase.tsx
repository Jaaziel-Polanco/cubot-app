"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Smartphone, Battery, Cpu, Camera, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanding } from "./LandingContext"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

const deviceData = {
    "CUBOT A20": {
        screen: "6.75\" HD+ 90Hz",
        processor: "Unisoc T606 Octa-Core",
        ram: "4GB + 4GB Expansion",
        storage: "128GB",
        battery: "5100mAh",
        camera: "20MP Main + 16MP Selfie",
        image: "/placeholder-phone.png"
    },
    "CUBOT X90": {
        screen: "6.67\" FHD+ AMOLED 120Hz",
        processor: "MediaTek Helio G99",
        ram: "16GB + 16GB Expansion",
        storage: "256GB",
        battery: "5000mAh 33W Fast Charge",
        camera: "100MP Main + 32MP Selfie",
        image: "/placeholder-phone.png"
    },
    "KingKong 9": {
        screen: "6.583\" FHD+ 120Hz",
        processor: "Helio G99 Octa-Core",
        ram: "12GB + 12GB Expansion",
        storage: "256GB",
        battery: "10600mAh",
        camera: "100MP Main + 24MP Night Vision",
        image: "/placeholder-phone.png"
    },
    "KingKong Star 2": {
        screen: "6.72\" FHD+ 144Hz",
        processor: "Dimensity 8200 5G",
        ram: "12GB + 12GB Expansion",
        storage: "512GB",
        battery: "10200mAh 65W Charging",
        camera: "100MP Main + 5MP Macro",
        image: "/placeholder-phone.png"
    },
    "KingKong Power 3": {
        screen: "6.5\" HD+",
        processor: "MT8788 Octa-Core",
        ram: "6GB + 6GB Expansion",
        storage: "128GB",
        battery: "10600mAh",
        camera: "48MP Main",
        image: "/placeholder-phone.png"
    },
    "TAB 70": {
        screen: "10.1\" HD+",
        processor: "Unisoc T606",
        ram: "4GB + 4GB Expansion",
        storage: "64GB",
        battery: "6000mAh",
        camera: "13MP Rear + 5MP Front",
        image: "/placeholder-phone.png"
    },
    "TAB 60": {
        screen: "10.1\" HD+",
        processor: "Allwinner A523",
        ram: "4GB + 4GB Expansion",
        storage: "128GB",
        battery: "6000mAh",
        camera: "13MP Rear + 5MP Front",
        image: "/placeholder-phone.png"
    },
    "CUBOT C29": {
        screen: "1.83\" HD Touch",
        processor: "Realtek 8762DK",
        ram: "N/A",
        storage: "N/A",
        battery: "280mAh (7 days)",
        camera: "N/A",
        image: "/placeholder-watch.png"
    },
    "CUBOT C28": {
        screen: "1.96\" AMOLED",
        processor: "Realtek 8763EWE",
        ram: "N/A",
        storage: "N/A",
        battery: "410mAh (10 days)",
        camera: "N/A",
        image: "/placeholder-watch.png"
    }
}

// All devices in one array
const allDevices = [
    { name: "CUBOT A20", image: "/placeholder-phone.png" },
    { name: "CUBOT X90", image: "/placeholder-phone.png" },
    { name: "CUBOT P80", image: "/placeholder-phone.png" },
    { name: "CUBOT NOTE 40", image: "/placeholder-phone.png" },
    { name: "KingKong 9", image: "/placeholder-phone.png" },
    { name: "KingKong Star 2", image: "/placeholder-phone.png" },
    { name: "KingKong Power 3", image: "/placeholder-phone.png" },
    { name: "KingKong AX", image: "/placeholder-phone.png" },
    { name: "TAB 70", image: "/placeholder-phone.png" },
    { name: "TAB 60", image: "/placeholder-phone.png" },
    { name: "TAB 50", image: "/placeholder-phone.png" },
    { name: "TAB 20", image: "/placeholder-phone.png" },
    { name: "CUBOT C29", image: "/placeholder-watch.png" },
    { name: "CUBOT C28", image: "/placeholder-watch.png" },
    { name: "CUBOT C7", image: "/placeholder-watch.png" },
    { name: "CUBOT N1", image: "/placeholder-watch.png" },
]

export function DeviceShowcase() {
    const { t } = useLanding()
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" })
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
    const [isAutoplayActive, setIsAutoplayActive] = useState(true)

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    // Autoplay implementation
    useEffect(() => {
        if (!emblaApi || !isAutoplayActive) return

        const autoplayInterval = setInterval(() => {
            emblaApi.scrollNext()
        }, 4000)

        return () => {
            clearInterval(autoplayInterval)
        }
    }, [emblaApi, isAutoplayActive])

    // Pause autoplay on user interaction
    useEffect(() => {
        if (!emblaApi) return

        const handleInteraction = () => {
            setIsAutoplayActive(false)
            setTimeout(() => setIsAutoplayActive(true), 10000)
        }

        emblaApi.on('pointerDown', handleInteraction)

        return () => {
            emblaApi.off('pointerDown', handleInteraction)
        }
    }, [emblaApi])

    const handleDeviceClick = (deviceName: string) => {
        if (deviceData[deviceName as keyof typeof deviceData]) {
            setSelectedDevice(deviceName)
        }
    }

    const getDeviceDetails = (name: string) => {
        return deviceData[name as keyof typeof deviceData] || {
            screen: "N/A", processor: "N/A", ram: "N/A", storage: "N/A", battery: "N/A", camera: "N/A", image: "/placeholder-phone.png"
        }
    }

    return (
        <section id="dispositivos" className="py-24 bg-background relative">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("devices.title")}</h2>
                    <p className="text-lg text-muted-foreground">{t("devices.subtitle")}</p>
                </div>

                {/* Carousel */}
                <div className="relative max-w-6xl mx-auto">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex -ml-4">
                            {allDevices.map((device, index) => (
                                <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4 min-w-0">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer"
                                        onClick={() => handleDeviceClick(device.name)}
                                    >
                                        <div className="relative h-64 mb-6 flex items-center justify-center bg-secondary/20 rounded-xl overflow-hidden">
                                            <Image
                                                src={device.image}
                                                alt={device.name}
                                                width={200}
                                                height={400}
                                                className="object-contain group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="bg-background/80 backdrop-blur text-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                                                    <Maximize2 className="w-4 h-4" /> {t("devices.view_details")}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{device.name}</h3>
                                        <Button variant="outline" size="sm" className="w-full mt-2">
                                            {t("devices.view_details")}
                                        </Button>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 hidden md:flex bg-background/80 backdrop-blur border shadow-sm hover:bg-background"
                        onClick={scrollPrev}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 hidden md:flex bg-background/80 backdrop-blur border shadow-sm hover:bg-background"
                        onClick={scrollNext}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Device Details Modal */}
            <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    {selectedDevice && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">{selectedDevice}</DialogTitle>
                                <DialogDescription>
                                    {t("devices.subtitle")}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid md:grid-cols-2 gap-6 py-4">
                                <div className="relative h-64 bg-secondary/20 rounded-xl flex items-center justify-center">
                                    <Image
                                        src={getDeviceDetails(selectedDevice).image}
                                        alt={selectedDevice}
                                        width={150}
                                        height={300}
                                        className="object-contain"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Smartphone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t("devices.specs.screen")}</p>
                                            <p className="font-medium">{getDeviceDetails(selectedDevice).screen}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Cpu className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t("devices.specs.processor")}</p>
                                            <p className="font-medium">{getDeviceDetails(selectedDevice).processor}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Battery className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t("devices.specs.battery")}</p>
                                            <p className="font-medium">{getDeviceDetails(selectedDevice).battery}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Camera className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t("devices.specs.camera")}</p>
                                            <p className="font-medium">{getDeviceDetails(selectedDevice).camera}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => setSelectedDevice(null)}>{t("devices.close")}</Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    )
}
