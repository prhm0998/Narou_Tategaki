type RangeInputProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  updateTrigger?: 'input' | 'change';
};

type RangeInputEmit = {
  (e: 'update:value', value: number): void;
};

export function useRangeInput(props: RangeInputProps, emit: RangeInputEmit) {
  const internalValue = ref(props.value);

  watch(() => props.value, (newValue) => {
    internalValue.value = newValue;
  });

  const handleUpdate = (eventType: 'input' | 'change', event: Event) => {
    const newValue = Number((event.target as HTMLInputElement).value);
    internalValue.value = newValue;

    if (props.updateTrigger === eventType || !props.updateTrigger) {
      console.log('1')
      emit('update:value', newValue);
    }
  };

  return {
    internalValue,
    handleUpdate,
  };
}