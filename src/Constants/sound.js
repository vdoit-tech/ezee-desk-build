export default function Tone(freq1, freq2) {
  // var context = new (window.AudioContext || window.webkitAudioContext)();
  // var osc1 = context.createOscillator();
  // var gainNode = context.createGain();
  // // var filter = context.createBiquadFilter();
  // gainNode.gain.value = 0.25;
  // // filter.type = "lowpass";
  // // filter.frequency = 8000;
  // // osc1.type = "sine";
  // osc1.frequency.value = freq1;
  // osc1.connect(gainNode);
  // osc1.start(0);
  // osc1.stop(context.currentTime + 1);
  var context = new (window.AudioContext || window.webkitAudioContext)();
  let osc1 = context.createOscillator();
  let osc2 = context.createOscillator();
  osc1.frequency.value = freq1;
  osc2.frequency.value = freq2;
  let gainNode = context.createGain();
  gainNode.gain.value = 0.25;
  let filter = context.createBiquadFilter();
  filter.type = "lowpass";
  // filter.frequency = 8000;
  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(filter);
  filter.connect(context.destination);
  osc1.start(0);
  osc2.start(0);

  setTimeout(() => {
    osc1.stop(0);
    osc2.stop(0);
  }, 200);
}
