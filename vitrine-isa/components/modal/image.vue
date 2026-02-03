<template>
  <div class="img-container">
    <div class="close-btn" @click="emit('close')">
      X
    </div>
    <div class="image" :style="{ backgroundImage: `url(${imageSrc}) ` }"></div>
  </div>
</template>

<script lang="ts" setup>

defineProps<{
  documentType: string | null,
  imageSrc: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()


</script>

<style scoped>
.img-container {
  width: 700px;
  height: 600px;
  background: white;
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;

}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--error);
  font-size: 25px;
  cursor: pointer;
}



.image {
  background: #000;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
}

.image img {
  width: 100%;
  height: 100%;
}

@media screen and (max-width : 1024px) {
  .img-container {
    width: 600px;
    height: 600px;
  }
}


@media screen and (max-width: 670px) {
  .img-container {
    width: 300px;
    height: 300px;
  }
}
</style>