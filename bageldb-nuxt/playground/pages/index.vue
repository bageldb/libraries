<template>
  <div>
    Nuxt module playground!
    Home!
    <pre wrap>
    { testSchema: {{ testSchema }} }
      <br>
		{{ projects }}
    </pre>
  </div>
</template>



<script lang="ts">
// import { useAsyncData } from 'nuxt/app';
// import type BagelNuxt from '../../src/runtime/bageldb-nuxt';

// import { defineNuxtComponent } from 'nuxt/app';
// import { useBagelDB } from '../src/runtime/composables';

// export default defineNuxtComponent({
// 	async asyncData({ $db }: { $db: BagelNuxt }) {
// 		const {data: projects} = await $db.getProject();
// 		// console.log('asyncData', {...projects});
// 		return {
// 			// data: {
// 				projects
// 			// }
// 		}
// 	},
// 	data() {
// 		return {
// 				testSchema: null
// 		}
// 	},

// 	async mounted() {
// * client side request * /
//     console.log('mounted', useBagelDB());

//     const { data: testSchema} = await this.$db
//                                           .schema('test')
//                                           .get();

//     this.testSchema = testSchema;


// 	},
// })
</script>

<script lang="ts" setup>
// * client side request * /
// import { useBagelDB } from '../../src/runtime/composables';
const { data: projects} = await useBagelDB().getProject();
const { data: testSchema} = await useBagelDB().schema('test').get();
// * client side request * /

// * server side request * /
// const { data } = await useAsyncData(async (NuxtApp) => {
//   const $db = NuxtApp?.$db as BagelNuxt;
//   const { data: projects} = await $db?.getProject?.() || {};
//   const { data: testSchema} = await $db?.schema?.('test').get() || {};
//   // console.log('useAsyncData', {projects, testSchema});

//   return {projects, testSchema};
// });

// const { projects, testSchema } = data.value || {};
// * server side request * /



</script>
