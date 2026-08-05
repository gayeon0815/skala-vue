<script setup>
defineProps({
  currentScope: { type: String, default: 'domestic' },
})

const emit = defineEmits(['update-scope'])
</script>

<template>
  <div class="scope-toggler">
    <button
      class="scope-btn"
      :class="{ active: currentScope === 'domestic' }"
      @click="emit('update-scope', 'domestic')"
    >
      <i class="fa-solid fa-house-flag"></i> 국내
    </button>
    <button
      class="scope-btn"
      :class="{ active: currentScope === 'overseas' }"
      @click="emit('update-scope', 'overseas')"
    >
      <i class="fa-solid fa-earth-americas"></i> 해외
    </button>
  </div>
</template>

<style scoped>
.scope-toggler {
  display: flex;
  gap: 4px;
  padding: 4px;
  background-color: #f1ecff;
  border-radius: 999px;
  width: fit-content;
  margin-bottom: 16px;
}
.scope-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: none;
  border-radius: 999px;
  background-color: transparent;
  color: #a6a0be;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.scope-btn:hover {
  color: #ff7faa;
}
.scope-btn.active {
  background-color: #ff7faa;
  color: #ffffff;
}
</style>
