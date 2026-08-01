'use client';

import { ArrowRight, Shield, CheckCircle2, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { LoadingLink } from '@/components/navigation/loading-link';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STATS = [
  { key: 'hero.statAffordable' as const, icon: CheckCircle2 },
  { key: 'hero.statClaims' as const, icon: Shield },
  { key: 'hero.statDigital' as const, icon: Smartphone },
];

export function LandingHero() {
  const t = useTranslations('landing');
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-8 sm:py-12 lg:py-16 flex items-center">
      {/* Hero background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ 
          backgroundImage: 'url(/images/hero/family-home.webp)'
        }}
      />
      
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/70 to-white/60 lg:from-white/75 lg:via-white/65 lg:to-transparent" />
      
      {/* Animated background blobs with 3D effect */}
      <motion.div 
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand-primary-light/50 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-brand-accent/20 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <motion.div 
        style={{ y, opacity }}
        className="relative mx-auto w-full max-w-7xl px-4 lg:px-8"
      >
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Left content - text and CTA */}
          <div className="text-center lg:text-left">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-3 text-xs font-semibold text-brand-primary sm:mb-4 sm:text-sm lg:text-base"
            >
              {t('tagline')}
            </motion.p>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-3 text-2xl font-bold leading-tight tracking-tight text-brand-primary sm:text-3xl lg:mb-4 lg:text-4xl xl:text-5xl"
            >
              {t('hero.headline')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-4 text-sm leading-relaxed text-brand-muted sm:text-base lg:mb-6 lg:text-lg"
            >
              {t('hero.subheadline')}
            </motion.p>

            <div className="mb-4 flex flex-wrap justify-center gap-2 lg:mb-6 lg:justify-start">
              {STATS.map(({ key, icon: Icon }, index) => (
                <motion.span
                  key={key}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-border/60 bg-white px-2.5 py-1 text-[10px] font-semibold text-brand-primary-dark shadow-sm cursor-default sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs lg:text-sm"
                >
                  <Icon className="h-3 w-3 text-brand-accent sm:h-3.5 sm:w-3.5" />
                  <span className="whitespace-nowrap">{t(key)}</span>
                </motion.span>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3 lg:justify-start"
            >
              <LoadingLink href="/register" className="sm:flex-1 lg:flex-none">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="pill-accent" className="w-full gap-2 py-4 text-sm font-bold sm:min-w-[180px] sm:py-5 lg:min-w-[200px] lg:py-6 lg:text-base">
                    {t('getStarted')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 lg:h-5 lg:w-5" />
                  </Button>
                </motion.div>
              </LoadingLink>
              <LoadingLink href="/login" className="sm:flex-1 lg:flex-none">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="w-full rounded-full py-4 text-sm sm:min-w-[180px] sm:py-5 lg:min-w-[200px] lg:py-6">
                    {t('login')}
                  </Button>
                </motion.div>
              </LoadingLink>
            </motion.div>
          </div>

          {/* Right content - 3D animated hero visual */}
          <div className="hidden justify-center lg:flex lg:justify-end">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex aspect-square w-full max-w-sm items-center justify-center perspective-1000 xl:max-w-md"
            >
              <div className="absolute inset-4 rounded-3xl bg-[radial-gradient(#1B6B3A_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
              <motion.div 
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.4 }}
                className="relative flex h-full w-full items-center justify-center rounded-3xl border border-brand-border/40 bg-gradient-to-br from-white to-brand-primary-light/40 p-6 shadow-elevated lg:p-8"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative">
                  {/* Pulsing glow effect */}
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -inset-4 rounded-full bg-brand-accent/20 blur-xl" 
                  />
                  
                  {/* Main shield circle */}
                  <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-brand-primary shadow-elevated lg:h-48 lg:w-48 xl:h-56 xl:w-56">
                    <Shield className="h-20 w-20 text-white lg:h-24 lg:w-24 xl:h-28 xl:w-28" strokeWidth={1.25} />
                  </div>
                  
                  {/* Floating checkmark icon */}
                  <motion.div
                    animate={{
                      y: [-10, 10, -10],
                      rotateZ: [-5, 5, -5],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-2 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-elevated lg:-right-2 lg:top-4 lg:h-14 lg:w-14 xl:-right-4 xl:top-6 xl:h-16 xl:w-16"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-brand-success lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
                  </motion.div>
                  
                  {/* Floating smartphone icon */}
                  <motion.div
                    animate={{
                      y: [10, -10, 10],
                      rotateZ: [5, -5, 5],
                    }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute -bottom-2 -left-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent shadow-elevated lg:-bottom-2 lg:-left-2 lg:h-14 lg:w-14 xl:-bottom-4 xl:-left-4 xl:h-16 xl:w-16"
                    whileHover={{ scale: 1.1, rotate: -10 }}
                  >
                    <Smartphone className="h-6 w-6 text-brand-primary-dark lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
