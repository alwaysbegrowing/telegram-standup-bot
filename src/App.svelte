<script>
  import Standup from "./bots/Standup.svelte";
  import StandupLogo from "./bots/StandupLogo.svelte";
  import Container from "./Container.svelte";

  let bots = [
    {
      name: "Standup",
      logo: StandupLogo,
      href: "#standup",
      component: Standup,
    },
  ];
</script>

<svelte:head>
  <style>
    @import url("https://use.typekit.net/thw2wbk.css");
    * {
      font-family: nimbus-sans, sans-serif;
      font-weight: 300;
      font-style: normal;
    }
  </style>
</svelte:head>

<div class="text-white bg-black">
  <Container {bots} />
</div>
