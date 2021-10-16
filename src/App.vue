<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import graph from '@/graph';
import GraphView from './graph/GraphView';

export default defineComponent({
  name: 'App',
  components: {},
  async mounted() {
    GraphView.convertURL = (url) => `http://em.site:5888/${url}`;
    const gv = new graph.GraphView({
      editable: true,
    });
    gv.load('displays/test.json');
    gv.mount(<HTMLDivElement>this.$refs.container);
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
