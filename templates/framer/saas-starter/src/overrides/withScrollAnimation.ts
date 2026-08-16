import type { ComponentType } from "react";
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0";

/**
 * Framer Code Override: withScrollAnimation
 * Adds smooth scroll-triggered viewport fade-and-slide transitions to any Framer layer.
 */
export function withScrollAnimation(Component: ComponentType): ComponentType {
  return (props) => {
    return (
      <Component
        {...props}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    );
  };
}

/**
 * Framer Code Override: withHoverScale
 * Adds springy scale on hover and tap feedback.
 */
export function withHoverScale(Component: ComponentType): ComponentType {
  return (props) => {
    return (
      <Component
        {...props}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    );
  };
}
