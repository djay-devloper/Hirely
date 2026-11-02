import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel'
import { Button } from './ui/button'
import { Link, useNavigate } from 'react-router-dom'

const categories = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "Full Stack Developer"
];

const CategoryCarousel = () => {
    const navigate = useNavigate();
    const searchJobHandler = query => navigate(`/jobs?keyword=${encodeURIComponent(query)}`);

    return (
        <section className="page-container py-12 sm:py-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">Explore by specialty</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">Where would you like to grow?</h2>
                </div>
                <Button asChild variant="ghost" className="rounded-xl text-violet-700 hover:text-violet-800">
                    <Link to="/jobs">Browse all jobs <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
            </div>
            <Carousel opts={{ align: "start" }} className="mx-10">
                <CarouselContent>
                    {categories.map(category => (
                        <CarouselItem key={category} className="basis-auto md:basis-1/3 lg:basis-1/4">
                            <Button
                                type="button"
                                onClick={() => searchJobHandler(category)}
                                variant="outline"
                                className="h-11 rounded-xl border-gray-200 bg-white px-5 font-medium text-gray-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"
                            >
                                {category}<ArrowRight className="ml-2 h-4 w-4 text-gray-400" />
                            </Button>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="-left-10 h-9 w-9 border-gray-200 bg-white shadow-sm" />
                <CarouselNext className="-right-10 h-9 w-9 border-gray-200 bg-white shadow-sm" />
            </Carousel>
        </section>
    );
};

export default CategoryCarousel;
