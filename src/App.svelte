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
    @font-face {
      font-family: "Titillium Web";
      src: url("fonts/TitilliumWeb-Regular.woff2") format("woff2"),
        url("fonts/TitilliumWeb-Regular.woff") format("woff");
    }
    @font-face {
      font-family: "Titillium Web";
      font-weight: 100;
      src: url("fonts/TitilliumWeb-Light.woff2") format("woff2"),
        url("fonts/TitilliumWeb-Light.woff") format("woff");
    }
    * {
      font-family: "Titillium Web";
    }
  </style>
</svelte:head>

<div class="text-gray-300 bg-black">
  <Container {bots} />
</div>
