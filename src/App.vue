<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import graph from "@/graph";
import GraphView from "./graph/GraphView";

export default defineComponent({
  name: "App",
  components: {},
  async mounted() {
    GraphView.convertURL = (url) => `storage/${url}`;
    const gv = new graph.GraphView({
      editable: true,
    });
    gv.load("displays/basic.json");
    gv.mount(<HTMLDivElement>this.$refs.container);
    // @ts-ignore
    window.gv = gv;
  },
});
</script>
<style>
body,
html {
  padding: 0;
  margin: 0;
}
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
}
</style>
