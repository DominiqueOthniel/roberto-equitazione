'use client';

import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export default function TestimonialsPage() {
  const testimonials = [
    {
      id: 1,
      name: 'Alexandra Hayes',
      date: 'January 12, 2025',
      rating: 5,
      text: 'Outstanding saddle. The leather quality is better than anything I have used. My horse is clearly more comfortable in dressage. Excellent customer service and professional advice.',
      discipline: 'Dressage',
      city: 'Lexington, KY',
    },
    {
      id: 2,
      name: 'Maria Bennett',
      date: 'January 25, 2025',
      rating: 5,
      text: 'I bought this for show jumping and I am thrilled. The saddle is beautifully balanced and supportive. After three months of hard work it still looks and feels new. Highly recommended!',
      discipline: 'Show Jumping',
      city: 'Wellington, FL',
    },
    {
      id: 3,
      name: 'James Carter',
      date: 'February 8, 2025',
      rating: 5,
      text: 'Madison Equestrian helped me find a saddle that truly fits my horse. The consultation was professional and careful. My horse has never shown discomfort. Worth every dollar.',
      discipline: 'Eventing',
      city: 'Aiken, SC',
    },
    {
      id: 4,
      name: 'Francesca Walsh',
      date: 'February 18, 2025',
      rating: 5,
      text: 'This is my second saddle from Madison Equestrian. The first lasted eight years and was still in great condition when I upgraded. Quality and shipping were both excellent.',
      discipline: 'Dressage',
      city: 'Middleburg, VA',
    },
    {
      id: 5,
      name: 'Marcus Cole',
      date: 'March 3, 2025',
      rating: 5,
      text: 'Excellent service from start to finish. They recommended the right saddle for my horse’s unusual shape. After two months, my trainer noticed a real improvement in posture.',
      discipline: 'Show Jumping',
      city: 'Tryon, NC',
    },
    {
      id: 6,
      name: 'Laura Espinosa',
      date: 'March 15, 2025',
      rating: 5,
      text: 'Finally a saddle that fits both of us. Comfortable, well made, and elegant. After a lot of research, Madison Equestrian was the best choice. Outstanding value.',
      discipline: 'Trail',
      city: 'Austin, TX',
    },
    {
      id: 7,
      name: 'David Lombard',
      date: 'March 28, 2025',
      rating: 5,
      text: 'Purchased for my daughter who competes in dressage. Light yet sturdy, perfect in the show ring. The finish is impeccable. We are 100% satisfied.',
      discipline: 'Dressage',
      city: 'Ocala, FL',
    },
    {
      id: 8,
      name: 'Claire Richardson',
      date: 'April 5, 2025',
      rating: 5,
      text: 'After years of cheap saddles I invested in quality. Comfort, durability, and style. My horse is more relaxed and I feel more secure. I will not go back.',
      discipline: 'Show Jumping',
      city: 'San Diego, CA',
    },
    {
      id: 9,
      name: 'Steven Moretti',
      date: 'April 14, 2025',
      rating: 5,
      text: 'Fantastic saddle. I always had fit issues until this one. The consultation made all the difference in finding the right solution.',
      discipline: 'Eventing',
      city: 'Camden, SC',
    },
    {
      id: 10,
      name: 'Elena March',
      date: 'April 22, 2025',
      rating: 5,
      text: 'The leather quality is exceptional and the craftsmanship shows in every detail. I also bought matching accessories and everything is perfect. I would recommend Madison Equestrian to anyone looking for a high-quality saddle.',
      discipline: 'Dressage',
      city: 'Sarasota, FL',
    },
    {
      id: 11,
      name: 'Lucas Reyes',
      date: 'May 1, 2025',
      rating: 5,
      text: 'Bought for the riding school where I work. We need durable, reliable saddles and this one delivers. After six months of heavy use with many riders, it still looks great.',
      discipline: 'Lesson Program',
      city: 'Parker, CO',
    },
    {
      id: 12,
      name: 'Sofia DeLuca',
      date: 'May 10, 2025',
      rating: 5,
      text: 'I was impressed by the attention to detail and the professionalism of the team. They guided me to the correct size and shared great care tips. Beautiful and functional.',
      discipline: 'Show Jumping',
      city: 'Greenwich, CT',
    },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-primary' : 'text-border'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-background pt-4">
      <section className="bg-muted border-b border-border py-12">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-text-primary mb-4">
              Customer Reviews
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              What riders across the United States say about our saddles
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-base"
              >
                <div className="flex items-center gap-2 mb-4">{renderStars(item.rating)}</div>
                <p className="text-text-secondary leading-relaxed mb-6">&ldquo;{item.text}&rdquo;</p>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-heading font-semibold text-lg">
                          {item.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-text-primary">{item.name}</p>
                        <p className="text-sm text-text-secondary">{item.city}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{item.date}</span>
                    <span className="px-2 py-1 bg-muted rounded-md text-text-secondary font-semibold text-xs">
                      {item.discipline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="max-w-container mx-auto px-4 lg:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-4">
              Share your experience
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Your story helps other riders choose with confidence.
            </p>
            <Link
              href={`mailto:${BRAND.email}?subject=${encodeURIComponent('Review for Madison Equestrian')}`}
              className="inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
            >
              Write a Review
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
