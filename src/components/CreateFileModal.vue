<template>
  <n-modal
      v-model:show="localShow"
      preset="dialog"
      title="📝 Tạo file mới"
      :positive-text="loading ? 'Đang tạo...' : 'Tạo file'"
      negative-text="Hủy"
      :loading="loading"
      @positive-click="handleCreate"
      @negative-click="handleCancel"
  >
    <n-form
        :model="localForm"
        label-placement="top"
        style="margin-top: 16px;"
    >
      <n-form-item label="Tên file">
        <n-input
            v-model:value="localForm.filename"
            placeholder="vd: my-file"
            @keyup.enter="handleCreate"
            clearable
        />
        <n-select
            v-model:value="localForm.extension"
            :options="extensionOptions"
            style="width: 100px; margin-left: 5px;"
        />
      </n-form-item>

      <n-form-item label="Nội dung ban đầu (tùy chọn)">
        <n-input
            v-model:value="localForm.content"
            type="textarea"
            :rows="5"
            placeholder="Để trống nếu muốn tạo file rỗng..."
            show-count
        />
      </n-form-item>

      <n-alert
          type="info"
          title="💡 Gợi ý"
          style="margin-top: 8px;"
      >
        File sẽ được lưu trong thư mục /storage/emulated/0/AutoEHT/
      </n-alert>
    </n-form>
  </n-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { NModal, NForm, NFormItem, NInput, NSelect, NAlert } from 'naive-ui'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  form: {
    type: Object,
    default: () => ({
      filename: '',
      extension: '.txt',
      content: ''
    })
  }
})

const emit = defineEmits(['update:show', 'update:form', 'create', 'cancel'])

const localShow = ref(props.show)
const localForm = ref({ ...props.form })

const extensionOptions = [
  { label: '.txt', value: '.txt' },
  { label: '.log', value: '.log' },
  { label: '.json', value: '.json' }
]

watch(() => props.show, (val) => {
  localShow.value = val
})

watch(localShow, (val) => {
  emit('update:show', val)
})

watch(() => props.form, (val) => {
  localForm.value = { ...val }
}, { deep: true })

watch(localForm, (val) => {
  emit('update:form', val)
}, { deep: true })

const handleCreate = () => {
  emit('create', localForm.value)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
:deep(.n-dialog) {
  max-width: 520px;
}

:deep(.n-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

:deep(.n-form-item-label) {
  font-weight: 500;
  color: #374151;
}

:deep(.n-input__suffix) {
  padding: 0;
}

:deep(.n-alert) {
  border-radius: 8px;
}
</style>
