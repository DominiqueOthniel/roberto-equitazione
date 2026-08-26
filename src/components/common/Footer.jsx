'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BRAND } from '@/lib/brand';

export default function Footer() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [expandedArticle, setExpandedArticle] = useState(null);

  const faqData = [
    {
      question: 'How do I choose the correct saddle size?',
      answer:
        'Saddle size depends on the rider’s thigh length and the horse’s conformation. A saddle that is too small restricts movement; one that is too large can feel unstable. We recommend trying saddles when possible and working with a professional fitter who can assess both you and your horse.',
    },
    {
      question: 'What is the difference between a dressage saddle and a jumping saddle?',
      answer:
        'Dressage saddles have longer, deeper flaps that support a more seated, elongated position. Jumping saddles have shorter, flatter flaps and shorter panels so the horse has more freedom over fences. Choose based on the discipline you ride most often.',
    },
    {
      question: 'How often should I maintain my saddle?',
      answer:
        'Regular care preserves leather quality and lifespan. Clean after each ride with products made for leather, check stitching and buckles monthly, and have a saddler inspect the tree and flocking at least once a year. A well-kept saddle can last for decades.',
    },
    {
      question: 'Are synthetic saddles a good alternative?',
      answer:
        'Synthetic saddles are often more affordable and easier to clean, which can suit beginners or heavy barn use. Natural leather typically offers greater comfort, longevity, and a better mold to horse and rider over time. For a long-term investment, we recommend quality leather.',
    },
    {
      question: 'How do I know if a saddle fits my horse?',
      answer:
        'A well-fitted saddle should not create pressure points, should allow about two fingers between the pommel and the withers, and should distribute weight evenly. Warning signs include white hairs, uneven sweat marks, restlessness, or loss of balance. A professional fitter can evaluate fit precisely.',
    },
    {
      question: 'What does a custom saddle mean?',
      answer:
        'A custom saddle is built around your horse’s back and your riding needs. The process may include a back tracing, panel type, flap shape, and other personalized details. It is often the best option for unusual conformation or riders who want a truly precise fit.',
    },
    {
      question: 'How long does it take to break in a new saddle?',
      answer:
        'Most new saddles need about 20–30 hours of riding to settle to the horse’s back. During that time, check for pressure points and, if possible, rotate with a known-good saddle. Patience in this phase pays off in years of comfort.',
    },
    {
      question: 'Are used saddles a good choice?',
      answer:
        'A used saddle can be excellent if it is in sound condition and fits well. Inspect stitching, leather, the tree, and any cracks. A quality used saddle from a respected maker can offer outstanding value compared with a mid-range new model.',
    },
  ];

  const articles = [
    {
      id: 1,
      title: 'Complete Guide to Choosing the Perfect Saddle',
      category: 'Saddles',
      excerpt: 'Learn how to select the right saddle for you and your horse, with a practical checklist before you buy.',
      content:
        'Saddle choice is one of the most important decisions in riding. A well-fitted saddle supports rider comfort and horse welfare. This guide covers seat size, horse conformation, discipline, and materials, plus how to spot a poor fit and when to work with a professional fitter.',
      date: 'January 15, 2024',
      readTime: '8 min',
    },
    {
      id: 2,
      title: 'Leather Saddle Care: Professional Secrets',
      category: 'Care',
      excerpt: 'Proven techniques to keep your saddle in excellent condition for decades.',
      content:
        'A well-cared-for saddle can last a lifetime. Regular cleaning, conditioning, weather protection, and proper storage preserve leather flexibility and prevent cracking. Learn which products to use, which to avoid, and how professionals maintain high-end leather.',
      date: 'January 22, 2024',
      readTime: '6 min',
    },
    {
      id: 3,
      title: 'Dressage vs. Jumping: Key Saddle Differences',
      category: 'Disciplines',
      excerpt: 'Understand how saddle design affects your position and your horse’s performance.',
      content:
        'Each discipline needs equipment built for its job. Dressage saddles use deeper seats and longer flaps for a classical position. Jumping saddles use shorter flaps and reduced panels for freedom over fences. This article compares construction, benefits, and how to choose by level and goals.',
      date: 'January 28, 2024',
      readTime: '7 min',
    },
    {
      id: 4,
      title: 'Why Saddle Fit Matters for Your Horse',
      category: 'Horse Health',
      excerpt: 'Learn why correct fit is essential and how to recognize problems early.',
      content:
        'A poorly fitted saddle can cause muscle soreness, white hairs, and even behavioral issues. Fit is not only about comfort—it is equine welfare. Watch for uneven sweat patterns, restlessness, and difficulty maintaining gait, and learn how a fitter evaluates the back.',
      date: 'February 5, 2024',
      readTime: '9 min',
    },
    {
      id: 5,
      title: 'Buying a Used Saddle: A Smart Shopper’s Guide',
      category: 'Buying',
      excerpt: 'What to inspect before you buy: quality, condition, and value.',
      content:
        'A used saddle can be a smart buy if you know what to look for. Check the tree, leather, stitching, and hidden wear. Learn which brands hold value and when a new saddle is the better investment so you can buy with confidence.',
      date: 'February 12, 2024',
      readTime: '10 min',
    },
    {
      id: 6,
      title: 'Modern Saddle Technology: Innovation and Tradition',
      category: 'Technology',
      excerpt: 'Explore new materials, balance systems, and ergonomic design in today’s saddles.',
      content:
        'Saddle making now blends traditional craft with modern materials, anatomical panels, and improved balance systems. This article looks at shock-absorbing designs and adjustable flocking while keeping the craftsmanship that defines a fine saddle.',
      date: 'February 19, 2024',
      readTime: '8 min',
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toggleArticle = (id) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  const footerLinks = {
    shop: [
      { label: 'Available Saddles', href: '/product-catalog' },
      { label: 'Cart', href: '/shopping-cart' },
    ],
    information: [
      { label: 'About Me', href: '/su-di-me' },
      { label: 'Reviews', href: '/testimonianze' },
      { label: 'Contact', href: `mailto:${BRAND.email}` },
    ],
  };

  return (
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="max-w-container mx-auto px-4 lg:px-6">
        <div className="py-12 border-b border-border">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-2">
              Articles & Guides
            </h2>
            <p className="text-text-secondary text-base">
              In-depth reading on saddles, riding, and horse care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-sm transition-base hover:shadow-md group"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                      {article.category}
                    </span>
                    <span className="text-xs text-text-secondary">{article.readTime}</span>
                  </div>

                  <h3 className="text-lg font-heading font-bold text-text-primary mb-2 group-hover:text-primary transition-fast">
                    {article.title}
                  </h3>

                  <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">{article.date}</span>
                    <button
                      onClick={() => toggleArticle(article.id)}
                      className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {expandedArticle === article.id ? 'Show less' : 'Read more'}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedArticle === article.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedArticle === article.id && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    <p className="text-sm text-text-secondary leading-relaxed font-body">
                      {article.content}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        <div className="py-12 border-b border-border">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Answers to common questions about riding and choosing the right saddle
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-sm transition-base hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-fast"
                  aria-expanded={openFaqIndex === index}
                >
                  <span className="font-body font-semibold text-text-primary pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-text-secondary flex-shrink-0 transition-transform ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaqIndex === index && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-text-secondary leading-relaxed font-body">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="py-12 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center mb-4 transition-fast hover:opacity-80">
                <Image
                  src={BRAND.logo}
                  alt={BRAND.name}
                  width={180}
                  height={180}
                  className="h-16 w-auto"
                  suppressHydrationWarning
                />
              </Link>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                Specialists in high-quality saddles for riders across the United States. Your passion, our expertise.
              </p>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-text-primary mb-4">Shop</h3>
              <ul className="space-y-2">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-text-secondary hover:text-primary transition-fast">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-text-primary mb-4">Information</h3>
              <ul className="space-y-2">
                {footerLinks.information.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-text-secondary hover:text-primary transition-fast">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-text-primary mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li>
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="hover:text-primary transition-fast flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {BRAND.email}
                  </a>
                </li>
                <li>
                  <a
                    href={BRAND.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-fast flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp {BRAND.whatsappDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={BRAND.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-fast flex items-center gap-2"
                  >
                    <span className="w-4 h-4 flex-shrink-0 text-center text-xs font-semibold">IG</span>
                    Instagram
                  </a>
                </li>
                <li>
                  <p className="text-xs text-text-secondary">United States</p>
                </li>
                <li>
                  <p className="text-xs text-text-secondary">
                    Personalized advice to help you choose the right saddle.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-secondary font-body text-center md:text-left">
              © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-text-secondary">
              <Link href="#" className="hover:text-primary transition-fast">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-fast">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
