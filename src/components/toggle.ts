import { registerComponent } from '../runtime/registry';

registerComponent('vibe-toggle', {
  data: () => ({ value: false, label: '' }),
  methods: {
    toggle() {
      this.value = !this.value;
      this.$emit('change', this.value);
    }
  },
  template: `<button type="button" class="vibe-toggle" v-bind:class="{ 'vibe-toggle--on': value }" v-on:click="toggle">
  <span class="vibe-toggle__thumb"></span>
  <span class="vibe-toggle__label">{{ label }}</span>
</button>`
});
