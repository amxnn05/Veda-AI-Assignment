"use client";

import React from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedButtonProps = MotionProps & {
    children?: React.ReactNode;
    as?: any;
    showBorderShine?: boolean;
    showCenterShine?: boolean;
  } & React.ComponentPropsWithoutRef<any>;

/**
 * AnimatedButton
 * - Matches user's requested style and motion
 * - Includes a subtle border shine and diagonal sweep shine (both optional)
 * - Supports 'as' prop for custom components (like Link)
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = "",
  as = "button",
  showBorderShine = true,
  showCenterShine = true,
  ...props
}) => {
  const Component = React.useMemo(() => {
    if (typeof as === "string") {
      return (motion as any)[as] || motion.button;
    }
    return motion(as);
  }, [as]);

  return (
    <Component
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold relative overflow-hidden inline-flex items-center justify-center",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {showBorderShine && (
        <motion.span
          className="block absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(-75deg, transparent 30%, var(--shine, rgba(255,255,255,0.4)) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            padding: "1px",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
          }}
          initial={{ backgroundPosition: "100% 0", opacity: 0 }}
          animate={{ backgroundPosition: ["100% 0", "0% 0"], opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1,
          }}
        />
      )}

      {showCenterShine && (
        <motion.span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, transparent 45%, var(--shine-inner, rgba(255,255,255,0.3)) 50%, transparent 55%)",
            backgroundSize: "300% 100%",
          }}
          initial={{ backgroundPosition: "150% 0", opacity: 0 }}
          animate={{ backgroundPosition: "-150% 0", opacity: [0, 1, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 2,
          }}
        />
      )}
    </Component>
  );
};

export default AnimatedButton;
