<template>
  <component
    v-if="is"
    :is="is"
    :style="{ 'background-image': `url(${src})` }"
  />
  <img
    v-else
    ref="img"
    :class="{ 'bgl-blur': !loaded, 'bgl-img': true }"
    :src="src"
    :srcset="srcset"
    :alt="alt || image.altText"
  />
</template>
<script>
export default {
  name: "bgl-image",
  props: { image: [Object], alt: String, is: String },
  data() {
    return {
      imgObserve: null,
      loaded: false,
      sizes: [480, 768, 991, 1200],
    };
  },
  mounted() {
    if (window) {
      this.observe(this.$refs.img);
    } else {
      this.loaded = true;
    }
  },
  methods: {
    observe(img) {
      this.imgObserve = new IntersectionObserver(
        (entries, imgObserver) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            } else {
              this.loaded = true;
              imgObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0, rootMargin: "0px 0px 500px 0px" }
      );
      this.imgObserve.observe(img);
    },
  },
  computed: {
    src() {
      if (!this.loaded) return this.image.imageURL + "&resize=50";
      return this.image.imageURL;
    },
    srcset() {
      if (!this.loaded) return "";
      return this.sizes
        .map((s) => `${this.image.imageURL}&resize=${s} ${s}w`)
        .join(",");
    },
  },
};
</script>

<style scoped>
.bgl-blur {
  filter: blur(5px);
}
.bgl-img {
  transition: 50ms ease;
}
</style>