var Visualizer = function (config) {
  this.audioContext = null;
  this.analyser = null;
  this.source = null; //the audio source
  this.config = config;
  this.frequency = [];
  this.playing = false;
  this.ready = false;
  this.loadFailed = false;
  this.oscillator = null
};
Visualizer.prototype = {
  init: function () {
    this._prepare();
    // this.getData();
    console.log('getdata done');
    this._analyser();
  },
  _prepare: function () {
    //实例化一个音频上下文类型window.AudioContext。目前Chrome和Firefox对其提供了支持，但需要相应前缀，Chrome中为window.webkitAudioContext，Firefox中为mozAudioContext。
    // 所以为了让代码更通用，能够同时工作在两种浏览器中，只需要一句代码将前缀进行统一即可。
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
    try {
      this.audioContext = new AudioContext();

    } catch (e) {
      console.log(e);
    }
  },
  _analyser: function () {
    var that = this;
    that.analyser = that.audioContext.createAnalyser();
    that.analyser.smoothingTimeConstant = 0.85;
    that.analyser.fftSize = 32;//傅里叶变换参数 简化成16个元素数组
    //将source与分析器连接
    // that.source.connect(that.analyser);
    
    // 创建一个OscillatorNode, 它表示一个周期性波形（振荡），基本上来说创造了一个音调
    this.oscillator = that.audioContext.createOscillator();
    // 创建一个GainNode,它可以控制音频的总音量
    var gainNode = that.audioContext.createGain();
    // 把音量，音调和终节点进行关联
    this.oscillator.connect(gainNode);
    // audioCtx.destination返回AudioDestinationNode对象，表示当前audio context中所有节点的最终节点，一般表示音频渲染设备
    gainNode.connect(that.analyser);
    // 指定音调的类型，其他还有square|triangle|sawtooth
    this.oscillator.type = 'sine';
    // 设置当前播放声音的频率，也就是最终播放声音的调调
    this.oscillator.frequency.value = 10000;

    //将分析器与destination连接，这样才能形成到达扬声器的通路
    that.analyser.connect(that.audioContext.destination);
    that.frequency = new Uint8Array(that.analyser.frequencyBinCount);
  },  
  getData: function () {
    var that = this;
    //建立缓存源
    that.source = that.audioContext.createBufferSource();
    var request = new XMLHttpRequest();
    //请求资源
    request.open('GET', that.config.url, true);
    request.responseType = 'arraybuffer';
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status === 200) {
          that.ready = true;
        } else {
          that.loadFailed = true;
        }
      }
    };
    request.onload = function () {
      var audioData = request.response;
      //解码
      that.audioContext.decodeAudioData(audioData, function (buffer) {
        that.source.buffer = buffer;
        //                        console.log(buffer.duration);//资源长度
        //                        that.source.connect(that.audioContext.destination);
        //将audioBufferSouceNode连接到audioContext.destination，
        // 这个AudioContext的destination也就相关于speaker（扬声器）。
        that.source.loop = that.config.loop || false;

      },
        function (e) { "Error with decoding audio data" + e.err });
    };
    request.send();
  },
  play: function () {
    var that = this;
    that.oscillator.start(that.audioContext.currentTime);
    that.playing = true;
    var timer = setInterval(function () {
      that.analyser.getByteFrequencyData(that.frequency);
      // if (that.source.buffer) {
        if (that.audioContext.currentTime > that.audioContext.duration) {
          that.oscillator.stop(0);
          that.playing = false;
          clearInterval(timer);
        }
      // }
    }, 100);
  },
  stop: function () {
    var that = this;
    that.oscillator.stop(that.audioContext.currentTime + 1);
    that.playing = false;
  }
};

const divs = document.querySelectorAll('.box')

var v = new Visualizer({
  url: "http://ting6.yymp3.net:82/new27/jam/1.mp3",//audio地址 没有写兼容跨域的方法，所以不能跨域
  loop: false//是否循环
});
v.init();
const timer = window.setInterval(function () {
  if (v.ready) {
    console.log("ready!");
  } else if (v.loadFailed) {
    console.log("加载失败");
  }
  if (v.playing) { //playing判断是否在播放
    console.log(v.frequency);//frequency是长度为16的频率值数组
    v.frequency.forEach((item, index) => {
      divs[index].style.transform = `scaleY(${item / 255})`
    })

    const sum = eval(v.frequency.join("+"))
    const ave = sum / 16
    console.log(sum, ave);
    divs[16].style.transform = `scaleY(${ave / 255})`
  }
}, 100);

document.querySelector("#stop").addEventListener('click', () => {
  v.stop()
})

document.querySelector("#start").addEventListener('click', () => {
  v.play()
})