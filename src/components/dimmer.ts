import { registerComponent } from '../runtime/registry';

registerComponent('vibe-dimmer', {
  data: () => ({ value: 0, min: 0, max: 100 }),
  methods: {
    _pos(e: any) {
      return e.touches && e.touches[0]
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };
    },
    _set(clientX: number, clientY: number) {
      const rect = this.el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
      const range = this.max - this.min;
      const v = Math.round((angle / 360) * range) + this.min;
      this.value = Math.min(this.max, Math.max(this.min, v));
      this.$emit('input', this.value);
    },
    start(e: any) {
      this._dragging = true;
      const p = this._pos(e);
      this._set(p.x, p.y);
    },
    move(e: any) {
      if (!this._dragging) return;
      const p = this._pos(e);
      this._set(p.x, p.y);
    },
    end() {
      if (!this._dragging) return;
      this._dragging = false;
      this.$emit('change', this.value);
    }
  },
  template: `<div class="vibe-dimmer" v-on:mousedown="start" v-on:touchstart="start" v-on:mousemove="move" v-on:touchmove="move" v-on:mouseup="end" v-on:touchend="end">
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" class="vibe-dimmer__track"></circle>
    <circle cx="50" cy="50" r="45" class="vibe-dimmer__value" transform="rotate(-90 50 50)" v-bind:stroke-dasharray="(value - min) / (max - min) * 282.7 + ' 282.7'"></circle>
  </svg>
  <span class="vibe-dimmer__text">{{ value }}</span>
</div>`
});
