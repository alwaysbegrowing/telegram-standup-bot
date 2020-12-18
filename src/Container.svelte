<script>
  import { fade } from "svelte/transition";
  export let bots = [];
  let menuOpen = false;
</script>

<div class="h-screen flex overflow-hidden bg-black">
  {#if menuOpen}
    <div class="md:hidden">
      <div class="fixed inset-0 flex z-40">
        <div class="fixed inset-0">
          <div class="absolute inset-0  opacity-75" />
        </div>
        <div class="relative flex-1 flex flex-col bg-black">
          <div class="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex">
            <div class="flex flex-col items-center flex-shrink-0 px-4 text-4xl">
              <div>Simple</div>
              <div class="text-xl font-thin text-right pr-1 -mt-2">Bots</div>
            </div>
            <button
              on:click={() => (menuOpen = false)}
              class="ml-1 flex items-center justify-center h-12 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span class="sr-only">Close sidebar</span>
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
              {#each bots as { logo, href, name }}
                <a
                  {href}
                  on:click={() => (menuOpen = false)}
                  class="transition hover:scale-110 hover: group flex-col flex items-center px-2 py-2  font-medium rounded-md">
                  <svelte:component this={logo} />
                  <span transition:fade class="text-2xl -mt-10">{name}</span>
                </a>
              {/each}
            </nav>
          </div>
        </div>
        <div class="flex-shrink-0 w-2" />
      </div>
    </div>
  {/if}
  <div
    class="absolute invisible md:visible md:relative md:flex md:flex-shrink-0">
    <div class="flex flex-col w-34">
      <div class="flex flex-col h-0 flex-1 border-r border-gray-200 ">
        <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div class="flex flex-col items-center flex-shrink-0 px-4 text-5xl">
            <div>Simple</div>
            <div class="text-2xl font-thin text-right pr-1 -mt-2">Bots</div>
          </div>
          <nav class="mt-5 flex-1 px-2  space-y-1">
            {#each bots as { logo, href, name }}
              <a
                {href}
                on:click={() => (menuOpen = false)}
                class="transition-all transform hover:scale-125 flex flex-col items-center px-2 py-2  font-medium rounded-md">
                <svelte:component this={logo} />
                <span class="text-3xl -mt-10">{name}</span>
              </a>
            {/each}
          </nav>
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-col w-0 flex-1 overflow-hidden">
    <div class="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex">
      <div class="flex flex-col items-center flex-shrink-0 px-4 text-4xl">
        <div>Simple</div>
        <div class="text-xl font-thin text-right pr-1 -mt-2">Bots</div>
      </div>
      <button
        on:click={() => (menuOpen = true)}
        class="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md  hover: focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
        <span class="sr-only">Open sidebar</span>
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
