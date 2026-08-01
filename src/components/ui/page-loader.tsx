'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface PageLoaderProps {
  fullScreen?: boolean;
}

export function PageLoader({ fullScreen = true }: PageLoaderProps) {
  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0 z-50' : 'relative w-full py-20'
      } flex items-center justify-center bg-gradient-to-br from-brand-primary-light/30 via-white to-brand-accent/10`}
    >
      <div className="relative">
        {/* Pulsing background glow */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -inset-8 rounded-full bg-brand-accent/20 blur-2xl"
        />

        {/* Main shield with rotation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark shadow-elevated"
        >
          <Shield className="h-10 w-10 text-white" strokeWidth={2} />
        </motion.div>

        {/* Loading dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="h-2 w-2 rounded-full bg-brand-primary"
            />
          ))}
        </div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center text-sm font-medium text-brand-primary"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}
