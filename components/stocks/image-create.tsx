"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"

export default function ImageCreate() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const images = [
        "/default-image.jpg?height=400&width=600",
        "/default-image.jpg?height=400&width=600",
        "/default-image.jpg?height=400&width=600",
        "/default-image.jpg?height=400&width=600",
    ]

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <Carousel className="w-full">
                <CarouselContent>
                    {images.map((src, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="p-1 cursor-pointer">
                                        <Image
                                            src={src}
                                            alt={`Image ${index + 1}`}
                                            width={600}
                                            height={400}
                                            className="rounded-lg object-cover w-full h-64"
                                            onClick={() => setSelectedImage(src)}
                                        />
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <Image
                                        src={selectedImage || ''}
                                        alt="Selected image"
                                        width={1200}
                                        height={800}
                                        className="rounded-lg object-contain w-full h-full"
                                    />
                                </DialogContent>
                            </Dialog>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    )
}