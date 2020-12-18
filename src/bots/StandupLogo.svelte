<script>
  import { onMount } from "svelte";
  import { draw, fade } from "svelte/transition";
  const FADE_TIME = 400;

  let frame = 0;
  onMount(() => {
    frame++;
    const lastIntervalId = setInterval(() => frame++, 10000);
    return () => clearInterval(lastIntervalId);
  });
</script>

<style>
  circle,
  path {
    stroke: #fff;
    fill: none;
    stroke-width: 5px;
  }
</style>

<div class="h-64 w-64">
  {#key frame}
    <svg
      out:fade={{ duration: FADE_TIME }}
      class="h-64 w-64"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 601 601">
      <defs />
      <path
        in:draw={{ delay: FADE_TIME, duration: 300 }}
        d="M251.19,502.9c7-10.2,61.18-91.65,30.58-192.94-28.84-95.45-110.45-134.09-122.83-139.7"
        transform="translate(0.5 0.5)" />
      <circle
        in:draw={{ delay: FADE_TIME + 300, duration: 400 }}
        cx="300.5"
        cy="141.98"
        r="75" />
      <path
        in:draw={{ delay: FADE_TIME + 300 * 2, duration: 400 }}
        d="M405.73,144.59a69.47,69.47,0,0,1,3.08,27.75c-2.35,24.79-17.78,40.85-23.44,46.11a72.46,72.46,0,0,1-8.75,7"
        transform="translate(0.5 0.5)" />
      <path
        in:draw={{ delay: FADE_TIME + 300 * 3, duration: 400 }}
        d="M427.14,133.42a97.38,97.38,0,0,1,4.33,38.88c-3.3,34.75-24.93,57.25-32.86,64.63a102.63,102.63,0,0,1-12.27,9.76"
        transform="translate(0.5 0.5)" />
      <path
        in:draw={{ delay: FADE_TIME + 300 * 4, duration: 400 }}
        d="M450.22,120.16A129,129,0,0,1,456,171.69c-4.37,46-33,75.87-43.55,85.64a134.78,134.78,0,0,1-16.25,12.94"
        transform="translate(0.5 0.5)" />
    </svg>
  {/key}
</div>
