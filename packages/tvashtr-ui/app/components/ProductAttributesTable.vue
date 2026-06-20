<template>
  <!-- Nothing renders if there are no attributes — zero DOM footprint -->
  <section v-if="hasAttributes" class="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
    <!-- Divider + heading -->
    <div class="border-t pt-12 mb-8" style="border-color: var(--border)">
      <h2 class="font-serif text-2xl sm:text-3xl" style="color: var(--text-primary)">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-1 text-sm" style="color: var(--text-muted)">
        {{ subtitle }}
      </p>
    </div>

    <!--
      Responsive grid of attribute cards.
      On mobile: 2 columns. sm: 3. lg: auto-fill up to 6 wide.
      Each card is a simple pill: label on top, value below.
    -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      <div
        v-for="(value, name) in attributes"
        :key="String(name)"
        class="rounded-2xl px-4 py-4 flex flex-col gap-1"
        style="background-color: var(--bg-muted)"
      >
        <span
          class="text-xs font-medium uppercase tracking-widest leading-none"
          style="color: var(--text-muted)"
        >
          {{ name }}
        </span>
        <span
          class="text-base font-semibold leading-tight"
          style="color: var(--text-primary)"
        >
          {{ value }}
        </span>
      </div>
    </div>

    <!-- Optional disclaimer / per-100g note etc. passed via slot -->
    <div v-if="$slots.footnote" class="mt-6 text-xs" style="color: var(--text-muted)">
      <slot name="footnote" />
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * ProductAttributesTable
 *
 * A fully generic attribute display component. Pass it:
 *   - `title`      — section heading ("Nutrition Information", "Specifications", …)
 *   - `subtitle`   — optional sub-heading (e.g. "Per 100 g serving")
 *   - `attributes` — Record<string, string> from useProductAttributes()
 *
 * The component is self-hiding: when `attributes` is empty it renders nothing at all.
 *
 * Slot: `footnote` — optional small-print under the cards (e.g. "* Reference intake of
 * an average adult (8400 kJ / 2000 kcal).")
 */
const props = defineProps<{
  title: string
  subtitle?: string
  attributes: Record<string, string>
}>()

const hasAttributes = computed(() => Object.keys(props.attributes).length > 0)
</script>
