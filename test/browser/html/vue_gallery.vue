<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { JustifiedGallery } from '@/justified-gallery';

const IMAGES = [
  ['6fj4l_2_3', '2:3'],
  ['88kdw_4_3', '4:3'],
  ['BxsII_1_1', '1:1'],
  ['Gk3da_2_3', '2:3'],
  ['K08Y5_2_3', '2:3'],
  ['Mzju9_9_16', '9:16'],
  ['NLMVO_1_1', '1:1'],
  ['Qe47i_4_5', '4:5'],
  ['QjjaS_3_2', '3:2'],
  ['TJS59_3_2', '3:2'],
  ['ZVqsG_3_2', '3:2'],
  ['ZoTcD_5_4', '5:4'],
  ['egC97_5_4', '5:4'],
  ['elR6o_5_4', '5:4'],
  ['fWAtG_16_9', '16:9'],
  ['gvw1i_4_5', '4:5'],
  ['snWVT_9_16', '9:16'],
  ['xuNBh_4_3', '4:3'],
  ['xyf7Q_16_9', '16:9'],
  ['y8Wtj_4_3', '4:3'],
] as const;

const galleryEl = ref<HTMLDivElement | null>(null);
let jg: JustifiedGallery | undefined;

onMounted(() => {
  if (!galleryEl.value) return;
  jg = new JustifiedGallery(galleryEl.value);
  jg.init();
});

onBeforeUnmount(() => {
  jg?.destroy();
});
</script>

<template>
  <div id="app">
    <h1>Vue Test</h1>
    <div id="gallery" ref="galleryEl">
      <a v-for="[name, ratio] in IMAGES" :key="name" :href="`../imgs/${name}.jpg`" :title="`title ${ratio}`">
        <img :src="`../imgs/${name}_m.jpg`" :alt="`Image ${ratio}`" />
      </a>
    </div>
  </div>
</template>
