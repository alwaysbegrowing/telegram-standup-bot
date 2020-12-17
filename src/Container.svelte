<script>
  export let bots = [];
  let menuOpen = false;
</script>

<div class="h-screen flex overflow-hidden bg-black">
  {#if menuOpen}
    <!-- Off-canvas menu for mobile, show/hide based on off-canvas menu state. -->
    <div class="md:hidden">
      <div class="fixed inset-0 flex z-40">
        <!--
        Off-canvas menu overlay, show/hide based on off-canvas menu state.

        Entering: "transition-opacity ease-linear duration-300"
          From: "opacity-0"
          To: "opacity-100"
        Leaving: "transition-opacity ease-linear duration-300"
          From: "opacity-100"
          To: "opacity-0"
      -->
        <div class="fixed inset-0">
          <div class="absolute inset-0  opacity-75" />
        </div>
        <!--
        Off-canvas menu, show/hide based on off-canvas menu state.

        Entering: "transition ease-in-out duration-300 transform"
          From: "-translate-x-full"
          To: "translate-x-0"
        Leaving: "transition ease-in-out duration-300 transform"
          From: "translate-x-0"
          To: "-translate-x-full"
      -->
        <div class="relative flex-1 flex flex-col bg-black">
          <div class="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex">
            <div class="text-4xl">Simple</div>
            <button
              on:click={() => (menuOpen = false)}
              class="ml-1 flex items-center justify-center h-12 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span class="sr-only">Close sidebar</span>
              <!-- Heroicon name: x -->
              <svg
                class="h-6 w-6 "
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <nav class="mt-5 px-2 space-y-1">
              {#each bots as { src, href, name }}
                <a
                  {href}
                  class=" hover: hover: group flex items-center px-2 py-2  font-medium rounded-md">
                  <!-- Heroicon name: users -->
                  <img class="w-24" {src} alt="standup" />
                  {name}
                </a>
              {/each}
            </nav>
          </div>
        </div>
        <div class="flex-shrink-0 w-2">
          <!-- Force sidebar to shrink to fit close icon -->
        </div>
      </div>
    </div>
  {/if}
  <!-- Static sidebar for desktop -->
  <div class="hidden md:flex md:flex-shrink-0">
    <div class="flex flex-col w-34">
      <!-- Sidebar component, swap this element with another sidebar if you like -->
      <div class="flex flex-col h-0 flex-1 border-r border-gray-200 ">
        <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-4 text-4xl">
            Simple
          </div>
          <nav class="mt-5 flex-1 px-2  space-y-1">
            {#each bots as { src, href, name }}
              <a
                {href}
                class="flex flex-col items-center px-2 py-2  font-medium rounded-md">
                <img class="w-24" {src} alt={name} />
                {name}
              </a>
            {/each}
          </nav>
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-col w-0 flex-1 overflow-hidden">
    <div class="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex">
      <div class="text-4xl">Simple</div>
      <button
        on:click={() => (menuOpen = true)}
        class="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md  hover: focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
        <span class="sr-only">Open sidebar</span>
        <!-- Heroicon name: menu -->
        <svg
          class={`h-6 w-6 ${menuOpen ? 'invisible' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
    <main
      class="flex-1 relative z-0 overflow-y-auto focus:outline-none"
      tabindex="0">
      {#each bots as { component, href }}
        <div id={href.replace('#', '')}>
          <svelte:component this={component} />
        </div>
      {/each}
    </main>
  </div>
</div>
