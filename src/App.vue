<script setup>
import WeatherParent from './components/practices/basic/WeatherParent.vue'
</script>

<template>
  <div class="page">
    <WeatherParent />
  </div>
</template>

<style>
.page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 20px;
  box-sizing: border-box;
  background-color: #f5f3fb;
}
</style>
