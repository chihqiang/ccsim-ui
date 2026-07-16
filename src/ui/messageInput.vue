<template>
  <div class="ccsim-input">
    <div class="ccsim-input__row">
      <div class="ccsim-input__field-wrap">
        <van-field
          v-model="text"
          type="textarea"
          :placeholder="placeholder"
          :border="false"
          rows="1"
          autosize
          @keydown.enter="onEnter"
          @compositionstart="isComposing = true"
          @compositionend="onCompositionEnd"
        />
      </div>
      <button
        :class="['ccsim-input__send', text.trim() ? 'ccsim-input__send--active' : '']"
        :disabled="!text.trim()"
        @click="send"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Field as VanField } from 'vant'

defineProps<{ placeholder?: string }>()
const emit = defineEmits<{ send: [text: string] }>()

const text = ref('')
const isComposing = ref(false)
const pendingEnter = ref(false)

function onEnter(e: KeyboardEvent) {
  if (isComposing.value) {
    pendingEnter.value = true
    return
  }
  if (e.shiftKey) return
  e.preventDefault()
  send()
}
function onCompositionEnd() {
  isComposing.value = false
  if (pendingEnter.value) {
    pendingEnter.value = false
    send()
  }
}
function send() {
  const trimmed = text.value.trim()
  if (!trimmed) return
  emit('send', trimmed)
  text.value = ''
}
</script>

<style scoped>
.ccsim-input {
  border-top: 1px solid var(--cl-border);
  background: var(--cl-bg-container);
  padding: var(--sp-2_5) var(--sp-3) var(--sp-3);
  flex-shrink: 0;
  --van-field-input-font-size: var(--font-size-base);
  --van-field-label-width: 0;
  --van-field-text-area-padding: 0;
  --van-cell-vertical-padding: 0;
  --van-cell-horizontal-padding: 0;
  --van-field-placeholder-text-color: var(--cl-text-placeholder);
  --van-cell-background: transparent;
  --van-field-text-area-min-height: 20px;
}

.ccsim-input__row {
  display: flex;
  align-items: flex-end;
  gap: var(--sp-2);
  max-width: 100%;
}

/* Input field wrapper */
.ccsim-input__field-wrap {
  flex: 1;
  min-width: 0;
  background: var(--cl-bg-page);
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--cl-border);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  padding: 7px 12px;
}
.ccsim-input__field-wrap:focus-within {
  border-color: var(--cl-primary);
  box-shadow: 0 0 0 3px var(--cl-primary-subtle);
}

/* Send button */
.ccsim-input__send {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cl-gray-200);
  color: var(--cl-white);
  cursor: pointer;
  transition: all var(--transition-bounce);
  flex-shrink: 0;
  border: none;
  outline: none;
  padding: 0;
}
.ccsim-input__send svg {
  width: 18px;
  height: 18px;
}
.ccsim-input__send:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.ccsim-input__send--active {
  background: var(--cl-primary);
  box-shadow: var(--shadow-btn);
}
.ccsim-input__send--active:not(:disabled):hover {
  transform: scale(1.08);
  box-shadow: var(--shadow-btn-hover);
}
.ccsim-input__send:active:not(:disabled) {
  transform: scale(0.92);
}
</style>
