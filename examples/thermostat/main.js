import { createApp } from 'vibe-js';

const app = createApp({
  data: () => ({
    sensor: {
      temperature: 21.5,
      humidity: 42,
      history: [21.0, 21.2, 21.4, 21.3, 21.5]
    },
    isOn: false,
    brightness: 60
  }),

  methods: {
    toggleConditioner() {
      this.isOn = !this.isOn;
    }
  },

  watch: {
    isOn(val) {
      console.log('Кондиционер:', val ? 'включён' : 'выключен');
    }
  },

  onMounted() {
    // Имитация показаний датчика раз в 2 секунды
    const self = this;
    setInterval(() => {
      const t = +(self.sensor.temperature + (Math.random() - 0.5)).toFixed(1);
      self.sensor.temperature = t;
      self.sensor.history.push(t);
      if (self.sensor.history.length > 30) self.sensor.history.shift();
    }, 2000);
  }
});

app.mount('#app');
