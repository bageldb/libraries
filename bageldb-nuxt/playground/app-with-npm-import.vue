<template>
  <div>
    Nuxt module playground!
    Hello!
    <pre wrap>
    { testSchema: {{ testSchema }} }
      <br>
		{{ projects }}
    </pre>
  </div>
</template>

<script lang="ts" setup>
import { useAsyncData } from 'nuxt/app';
import type BagelNuxt from '@bageldb/bageldb-nuxt/dist/runtime/bageldb-nuxt';

// * client side request * /
// import { useBagelDB } from '@bageldb/bageldb-nuxt/dist/runtime/composables';
// const { data: projects} = await useBagelDB().getProject();
// const { data: testSchema} = await useBagelDB().schema('test').get();

// * server side request * /
const { data } = await useAsyncData(async (NuxtApp) => {
  const $db = NuxtApp?.$db as BagelNuxt;

  const { data: projects} = await $db?.getProject?.() || {};
  const { data: testSchema} = await $db?.schema?.('test').get() || {};

  return {projects, testSchema};
});

const { projects, testSchema } = data.value || {};
</script>
