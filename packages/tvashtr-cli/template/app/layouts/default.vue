<template>
  <div class="min-h-screen flex flex-col" style="background-color: var(--bg-page)">
    <NavBar />
    <CartDrawer />
    <main class="flex-1">
      <slot />
    </main>
    <FooterBar />
  </div>
</template>
