<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <AutoControl />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui'
import AutoControl from './components/AutoControl.vue'

const themeOverrides = {
  common: {
    primaryColor: '#667eea',
    primaryColorHover: '#764ba2',
    primaryColorPressed: '#5568d3'
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  //font-family: 'Bangers', cursive;
  font-family: 'VNF-ComicSans', cursive, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  width: 100%;
}

:focus, :focus-visible {
    outline: none !important;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  body {
    font-size: 13px;
  }
}
</style>
