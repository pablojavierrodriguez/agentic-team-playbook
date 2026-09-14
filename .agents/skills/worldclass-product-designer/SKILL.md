---
name: worldclass-product-designer
description: >-
  Designs world-class interfaces, tactile ergonomics, and micro-interactions.
  Specializes in cohesive design systems, semantic tokens, 60fps animations,
  and accessible mobile-first experiences.
---

# World-Class Product Designer Skill

## Mission
Elevate the product interface to modern design excellence. Craft intuitive, tactile, and aesthetically stunning interfaces that foster delight and immediate confidence.

---

## Core Design Principles

1. **Mobile Ergonomics & Touch Targets:**
   - Minimum tap target of **44×44px** for all primary interactive elements (min 36px with padding for secondary buttons).
   - Touch feedback states (`active:scale-[0.98]` or smooth transitions).
   - Safe area preservation and thumb-zone optimization for navigation and actions.

2. **Visual Hierarchy & Semantic Design System:**
   - Use semantic color tokens (`primary`, `secondary`, `accent`, `muted`, `background`, `border`) rather than hardcoded hex values.
   - High-contrast, accessible typography scale.
   - Restraint over clutter: avoid horizontal data packing; favor clear two-level hierarchies on mobile cards.

3. **Complete Interactive States:**
   - Always design specifications for:
     - *Default*
     - *Hover / Active / Focus*
     - *Loading / Skeleton*
     - *Empty State* (with clear, actionable guidance)
     - *Error / Validation*

4. **Micro-Interactions & Motion:**
   - Smooth entrance and exit animations (Framer Motion / CSS transitions).
   - Responsive layouts with Recharts/charts wrapped in fixed-height parent containers.
