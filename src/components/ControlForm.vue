<template>
  <n-card title="⚙️ Điều khiển" class="glass-card" :bordered="false">
    <n-form :label-placement="isMobile ? 'top' : 'left'" label-width="140" :label-align="isMobile ? 'left' : 'left'">
      <n-form-item label="🌐 Domain">
        <n-input
            v-model:value="localDomain"
            placeholder="vubq.serveousercontent.com"
            @update:value="handleDomainChange"
            size="large"
            :disabled="isRunning"
            style="text-align: left;"
        >
          <template #prefix>
            <span style="opacity: 0.6;">https://</span>
          </template>
        </n-input>
      </n-form-item>

      <n-form-item label="🎯 Loại Auto">
        <n-select
            v-model:value="localAutoType"
            :options="autoTypeOptions"
            size="large"
            :disabled="isRunning"
            style="text-align: left;"
        />
      </n-form-item>

      <n-form-item label="📋 Kịch bản" v-if="showScenario">
        <n-select
            v-model:value="localScenario"
            :options="scenarioOptions"
            size="large"
            :disabled="isRunning"
            style="text-align: left;"
        />
      </n-form-item>

      <n-form-item label="🔍 Thiết lập B" v-if="localAutoType === 'Trang bị'">
        <n-switch
            v-model:value="localSearchB"
            :disabled="isRunning"
        >
          <template #checked>Bật</template>
          <template #unchecked>Tắt</template>
        </n-switch>
      </n-form-item>

      <n-space :vertical="isMobile" :size="12" style="width: 100%; margin-top: 8px;">
        <n-button
            type="success"
            @click="handleStart"
            :loading="startLoading"
            :disabled="isRunning"
            size="large"
            :block="isMobile"
            class="action-btn start-btn"
        >
          <template #icon>
            <span style="font-size: 16px;">▶️</span>
          </template>
          Khởi động Auto
        </n-button>
        <n-button
            type="error"
            @click="handleStop"
            :loading="stopLoading"
            :disabled="!isRunning"
            size="large"
            :block="isMobile"
            class="action-btn stop-btn"
        >
          <template #icon>
            <span style="font-size: 16px;">⏹️</span>
          </template>
          Dừng Auto
        </n-button>
      </n-space>
    </n-form>
  </n-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { NCard, NForm, NFormItem, NInput, NSelect, NSwitch, NSpace, NButton } from 'naive-ui'

const props = defineProps({
  domainServer: String,
  autoType: String,
  scenario: String,
  searchB: Boolean,
  isRunning: Boolean,
  startLoading: Boolean,
  stopLoading: Boolean,
  isMobile: Boolean
})

const emit = defineEmits(['update:domainServer', 'update:autoType', 'update:scenario', 'update:searchB', 'start', 'stop', 'domain-change'])

const localDomain = ref(props.domainServer)
const localAutoType = ref(props.autoType)
const localScenario = ref(props.scenario)
const localSearchB = ref(props.searchB)

const autoTypeOptions = [
  { label: '🛡️ Trang bị', value: 'Trang bị' },
  { label: '⚔️ Cường hóa', value: 'Cường hóa' },
  { label: '🧬 Tẩy thuộc tính', value: 'Tẩy thuộc tính' },
  { label: '🎁 Thú cưỡi', value: 'Thú cưỡi' },
  { label: '📦 Rương boss', value: 'Rương boss' },
  { label: '🎭 Tính cách', value: 'Tính cách' },
  { label: '📦 Rương trang bị thú', value: 'Rương trang bị thú' },
  { label: '💖 Đai lưng', value: 'Đai lưng' },
  { label: '👑 Đai lưng MAX', value: 'Đai lưng MAX' },
  { label: '🏰 Hầm ngục', value: 'Hầm ngục' },
  { label: '💾 Backup', value: 'Backup' },
  { label: '♻️ Restore', value: 'Restore' },
  { label: '📜 Script', value: 'Script' },
  { label: '🧪 Test', value: 'Test' },
]

const showScenario = computed(() => {
  return localAutoType.value === 'Trang bị' ||
      localAutoType.value === 'Cường hóa' ||
      localAutoType.value === 'Tẩy thuộc tính'
})

const scenarioOptions = computed(() => {
  if (localAutoType.value === 'Cường hóa' || localAutoType.value === 'Tẩy thuộc tính') {
    return [
      { label: '🟥 Ô 1', value: 'Ô 1' },
      { label: '🟧 Ô 2', value: 'Ô 2' },
      { label: '🟨 Ô 3', value: 'Ô 3' },
      { label: '🟩 Ô 4', value: 'Ô 4' },
      { label: '🟦 Ô 5', value: 'Ô 5' },
      { label: '🟪 Ô 6', value: 'Ô 6' },
      { label: '⬛ Ô 7', value: 'Ô 7' },
      { label: '⬜ Ô 8', value: 'Ô 8' },
    ]
  }

  if (localAutoType.value === 'Trang bị') {
    return [
      { label: '🛡️ Giáp', value: 'Giáp' },
      { label: '🧤 Găng', value: 'Găng' },
      { label: '🥾 Giày', value: 'Giày' },
      { label: '📿 Dây chuyền', value: 'Dây chuyền' },
      { label: '💍 Nhẫn', value: 'Nhẫn' },
      { label: '⚔️ Vũ khí', value: 'Vũ khí' },
    ]
  }

  return []
})

watch(() => props.domainServer, (val) => {
  localDomain.value = val
})

watch(() => props.autoType, (val) => {
  localAutoType.value = val
})

watch(() => props.scenario, (val) => {
  localScenario.value = val
})

watch(() => props.searchB, (val) => {
  localSearchB.value = val
})

watch(localDomain, (val) => {
  emit('update:domainServer', val)
})

watch(localAutoType, (val) => {
  emit('update:autoType', val)
  // Auto set first scenario when type changes
  if (scenarioOptions.value.length > 0) {
    localScenario.value = scenarioOptions.value[0].value
  }
})

watch(localScenario, (val) => {
  emit('update:scenario', val)
})

watch(localSearchB, (val) => {
  emit('update:searchB', val)
})

const handleDomainChange = (value) => {
  emit('domain-change', value)
}

const handleStart = () => {
  emit('start')
}

const handleStop = () => {
  emit('stop')
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

.glass-card :deep(.n-card-header) {
  padding: 20px 24px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.glass-card :deep(.n-card__content) {
  padding: 24px;
}

.action-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.start-btn {
  flex: 1;
}

.stop-btn {
  flex: 1;
}

@media (max-width: 768px) {
  .glass-card :deep(.n-card-header) {
    padding: 16px;
    font-size: 16px;
  }

  .glass-card :deep(.n-card__content) {
    padding: 16px;
  }
}
</style>
