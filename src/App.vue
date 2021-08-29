<template>
  <div class="container"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import graph from '@/graph';
import DataModel from './graph/DataModel';

export default defineComponent({
  name: 'App',
  components: {},
  async mounted() {
    graph.utils.convertURL = function (url: string) {
      return `storage/${url}`;
    };
    const json = await graph.utils.load('displays/display.json');
    const gv = new graph.GraphView({
      editable: true,
    });
    const dm = new DataModel();
    gv.setDataModel(dm);
    dm.deserialize(json);
    // @ts-ignore
    window.dm = dm

    const node = new graph.Node();
    node.image = 'symbols/demo/image.json'
    node.x = 200;
    node.y = 200;
    node.width = 352.19811;
    node.height = 352.19811;
    // dm.add(node);
    
    gv.mount(this.$el);

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
