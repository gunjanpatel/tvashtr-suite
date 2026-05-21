/**
 * app/store/home.config.ts — default store home page content
 *
 * All content for the index.vue home sections lives here.
 * Change this file to update the homepage without touching page logic.
 */

// Read FREE_DELIVERY_THRESHOLD at module level so it can be used in config.
// index.vue passes config.public.freeDeliveryThreshold to build the sections.
export function buildHomeConfig(freeDeliveryThreshold: number) {
  return [
    {
      type: 'hero' as const,
      props: {
        subtitle: 'Artisanal Quality',
        title: 'Crafted Just<br>For You.',
        description:
          'Enjoy premium, small-batch products — prepared on request and delivered with care.',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
        ctaText: 'Browse Collection',
        ctaLink: '/products',
        badges: [
          { icon: '🌟', label: 'Premium Quality' },
          { icon: '🚚', label: `Free Neighborhood Delivery over DKK ${freeDeliveryThreshold}` },
        ],
        floatingLabel: 'Happy Customers',
        floatingIcon: '❤️',
      },
    },
    {
      type: 'products' as const,
      props: {
        subtitle: 'Staff Picks',
        title: 'Popular Products',
        viewAllLink: '/products',
        bgColor: 'var(--bg-muted)',
      },
    },
    {
      type: 'recipes' as const,
      props: {
        subtitle: 'Kitchen Inspiration',
        title: 'From Our Kitchen to Yours',
      },
    },
    {
      type: 'features' as const,
      props: {
        features: [
          { icon: '✨', title: 'Made on Order', desc: 'Prepared in small batches upon request' },
          { icon: '🌿', title: 'Premium Ingredients', desc: 'Sourced from the best suppliers' },
          {
            icon: '🚚',
            title: 'Neighborhood Delivery',
            desc: `Free Neighborhood Delivery for orders above DKK ${freeDeliveryThreshold}`,
          },
          { icon: '📦', title: 'Carefully Packed', desc: 'Sealed immediately to preserve quality' },
        ],
      },
    },
  ]
}
