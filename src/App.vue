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
    GraphView.convertURL = (url) => `storage/${url}`;
    const gv = new graph.GraphView({
      editable: true,
    });
    gv.load('displays/basic.json').then(() => {
      const shape = new graph.Node();
      shape.setStyle({
        shape: 'circle',
        'shape.background': '#FF7C7C',
        'shape.border.width': 12,
        'shape.border.color': 'rgb(51,153,255)',
      });
      shape.setWidth(205);
      shape.setHeight(159);
      shape.setPosition({
        x: 145,
        y: 215,
      });
      gv.addData(shape);

      const album = new graph.Node();
      album.setImage('symbols/demo/album.json');
      album.setWidth(100);
      album.setHeight(100);
      album.setPosition({
        x: 200,
        y: 200,
      });
      gv.addData(album);
    });
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
