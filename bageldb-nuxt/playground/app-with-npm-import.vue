<template>
  <div>
    Nuxt module playground! Hello!
    <pre wrap>
    { testSchema: {{ testSchema }} }
      <br>
		{{ projects }}
    </pre>
  </div>
</template>

<script lang="ts" setup>
// * client side request * /
// const { data: projects} = await useBagelDB().getProject();
// const { data: testSchema} = await useBagelDB().schema('changeMe').get();
// * client side request * /

// * server side request * /
import { useAsyncData } from 'nuxt/app';
import type BagelNuxt from '@bageldb/bageldb-nuxt/dist/runtime/bageldb-nuxt';
const { data } = await useAsyncData(async (NuxtApp) => {
  const $db = NuxtApp?.$db as BagelNuxt;

  const { data: projects } = (await $db?.getProject?.()) || {};
  const { data: testSchema } = (await $db?.schema?.('changeMe').get()) || {};

  return { projects, testSchema };
});

const { projects, testSchema } = data.value || {};
// * server side request * /
</script>
