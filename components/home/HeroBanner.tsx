import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ── Hero Banner Carousel ── */
export const HERO_SLIDES = [
    {
        tag: 'Fresh Picks',
        title: 'Fresh & Fast\nto Your Door',
        cta: 'Shop Now →',
        href: '/store',
        image: '/assets/imgs/banner/fruits.jpg',
    },
    {
        tag: 'Daily Dairy',
        title: 'Farm Fresh\nDairy & Milk',
        cta: 'Browse Dairy →',
        href: '/store?category=100',
        image: '/assets/imgs/banner/dairy.jpg',
    },
    {
        tag: 'Weekly Deals',
        title: 'Save Big\nEvery Week',
        cta: 'View Deals →',
        href: '/store',
        image: '/assets/imgs/banner/groceries.jpg',
    },
    {
        tag: 'Bread & Bakery',
        title: 'Fresh Baked\nEvery Morning',
        cta: 'Shop Bread →',
        href: '/store?category=101',
        image: '/assets/imgs/banner/bread.jpg',
    },
];

export function HeroBanner() {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const next = useCallback(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), []);
    const prev = useCallback(() => setCurrent(c => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), []);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches[0]) {
            setTouchStart(e.touches[0].clientX);
            setPaused(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches[0]) {
            setTouchEnd(e.touches[0].clientX);
        }
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const delta = touchStart - touchEnd;
        if (Math.abs(delta) > 50) {
            // Swipe left (delta > 0) = next slide
            // Swipe right (delta < 0) = prev slide
            if (delta > 0) {
                next();
            } else {
                prev();
            }
        }
        setPaused(false);
        setTouchStart(0);
        setTouchEnd(0);
    };

    useEffect(() => {
        if (paused) return undefined;
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [paused, next]);

    const slide = HERO_SLIDES[current]!;
    const [titleLine1, titleLine2] = slide.title.split('\n');

    return (
        <section
            className="sf-section-gap"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div
                className="sf-hero"
                style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="sf-hero-img-overlay" />
                <div className="sf-hero-content">
                    <div className="sf-hero-tag">{slide.tag}</div>
                    <div className="sf-hero-title">{titleLine1}<br /><span>{titleLine2}</span></div>
                    <Link href={slide.href} className="sf-hero-cta">{slide.cta}</Link>
                </div>

                {/* Navigation arrows */}
                <button type="button" className="sf-hero-arrow sf-hero-arrow-left" onClick={prev} aria-label="Previous slide">&#8249;</button>
                <button type="button" className="sf-hero-arrow sf-hero-arrow-right" onClick={next} aria-label="Next slide">&#8250;</button>

                {/* Dots */}
                <div className="sf-hero-dots">
                    {HERO_SLIDES.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setCurrent(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            className={`sf-hero-dot ${current === i ? 'active' : ''}`}
                        />
                    ))}
                </div>
                <span className="sf-hero-swipe-hint" aria-hidden="true">‹ swipe ›</span>
            </div>
        </section>
    );
}
