import { registerComponent } from '../runtime/registry';

registerComponent('vibe-chart', {
  data: () => ({ data: [], width: 200, height: 80 }),
  computed: {
    points(): string {
      const d = this.data;
      if (!d || d.length === 0) return '';
      let min = d[0];
      let max = d[0];
      for (let i = 1; i < d.length; i++) {
        if (d[i] < min) min = d[i];
        if (d[i] > max) max = d[i];
      }
      const range = max - min || 1;
      const w = this.width;
      const h = this.height;
      const step = d.length > 1 ? w / (d.length - 1) : 0;
      let pts = '';
      for (let i = 0; i < d.length; i++) {
        const x = (i * step).toFixed(1);
        const y = (h - ((d[i] - min) / range) * h).toFixed(1);
        pts += (i === 0 ? '' : ' ') + x + ',' + y;
      }
      return pts;
    }
  },
  template: `<svg class="vibe-chart" viewBox="0 0 200 80" preserveAspectRatio="none" v-bind:width="width" v-bind:height="height">
  <polyline class="vibe-chart__line" v-bind:points="points"></polyline>
</svg>`
});
