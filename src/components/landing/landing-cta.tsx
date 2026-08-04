'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { LoadingLink } from '@/components/navigation/loading-link';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';

export function LandingCta() {
  const t = useTranslations('landing');

  return (
    <section className="w-full -mb-px">
      <AnimatedSection>
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary-darker px-8 py-12 text-center text-white shadow-elevated transition-shadow duration-500 hover:shadow-modal lg:px-16 lg:py-16 w-full">
          {/* Animated floating blobs */}
          <motion.div 
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-accent/25 blur-2xl" 
          />
          <motion.div 
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-brand-accent/30 blur-2xl" 
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent" />

          <div className="relative">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-3 text-2xl font-bold lg:text-3xl"
            >
              {t('cta.title')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mb-8 max-w-xl text-base text-white/85 lg:text-lg"
            >
              {t('cta.subtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <LoadingLink href="/register" className="inline-block">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="pill-accent"
                    className="gap-2 px-8 py-6 text-base font-bold shadow-modal"
                  >
                    {t('cta.button')}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </LoadingLink>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
