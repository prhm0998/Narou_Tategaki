<template>
  <div id="WXT-FIELD">
    <button class="name-button" @click="handleUpsertName(name)">name
      <span class="tooltip">{{ name }}</span>
    </button>
    <button class="word-button" @click="handleUpsertWord(word)">word
      <span class="tooltip">{{ word }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  upsertWord: (word: string) => void
  word: string
  upsertName: (name: string) => void
  name: string
  onIgnoreAdd: () => void
}>()

const handleUpsertWord = (word: string) => {
  props.upsertWord(word)
  props.onIgnoreAdd()
  // emitを使用してイベントを発火したい時はこっち
  // emit('ignoreAdd')

}
const handleUpsertName = (name: string) => {
  props.upsertName(name)
  props.onIgnoreAdd()
}

</script>

<style lang="scss" scoped>
.name-button,
.word-button {
  position: relative;
  display: inline-block;
  margin: 4px;
  padding: 5px 10px;
  font-size: 10px;
  border: none;
  border-radius: 5px;
  background-color: #b6e4b6;
  cursor: pointer;

  &.name-button {
    margin: 4px;
  }

  /* name Green */
  &.word-button {
    background-color: #e4dbb6;
    /* name Green */
  }

  .tooltip {
    visibility: hidden;
    width: 120px;
    background-color: #000;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    /* Position above the button */
    left: 50%;
    margin-left: -60px;
    /* Center the tooltip */
    opacity: 0;
    transition: opacity 0.5s;

    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: #000 transparent transparent transparent;
    }
  }

  &:not(:hover) {
    opacity: 0.2;
  }

  &:hover {
    opacity: 1;
    background-color: #6adf6a;
    color: rgb(0, 0, 0);

    /* name */
    &.word-button {
      background-color: #e4c547;
      /* word */
    }
  }

  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
}

.name-button {
  margin-left: 36px;
}
</style>