(function(){
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const demoInput = document.getElementById('demo-input');
  const status = document.getElementById('status');
  const liveLog = document.getElementById('live-log');
  const clearBtn = document.getElementById('clear-log');
  const downloadBtn = document.getElementById('download-sample');
  const indicator = document.getElementById('indicator');
  const indicatorLabel = document.getElementById('indicator-label');

  let active = false;
  let listener = null;
  let log = [];

  function formatTime(d){ return d.toLocaleTimeString(); }

    function setIndicator(on){
    const light = document.getElementById('indicator');
    const label = document.getElementById('indicator-label');

    if(on){
        light.classList.add('active');
        label.textContent = 'Logging: on';
        light.setAttribute('aria-label','Logging is on');
    } else {
        light.classList.remove('active');
        label.textContent = 'Logging: off';
        light.setAttribute('aria-label','Logging is off');
    }
    }


  function addLogEntry(obj){
    log.push(obj);
    const el = document.createElement('div');
    el.className = 'log-line';
    const key = obj.masked ? '[MASKED]' : obj.key;
    el.textContent = `${obj.time} — key: ${key} — code: ${obj.code} — type: ${obj.type}`;
    liveLog.appendChild(el);
    liveLog.scrollTop = liveLog.scrollHeight;
  }

  function startDemo(){
    if(active) return;
    active = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    setIndicator(true);

    listener = function(e){
      const isPassword = e.target && e.target.type === 'password';
      const entry = {
        time: formatTime(new Date()),
        key: e.key,
        code: e.code,
        type: e.type,
        masked: isPassword
      };
      if(isPassword) entry.key = null;
      addLogEntry(entry);
    };
    demoInput.addEventListener('keydown', listener);
    log = [];
    liveLog.innerHTML = '';
    demoInput.focus();
  }

  function stopDemo(){
    if(!active) return;
    active = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    setIndicator(false);
    if(listener) demoInput.removeEventListener('keydown', listener);
    listener = null;
  }

  startBtn.addEventListener('click', startDemo);
  stopBtn.addEventListener('click', stopDemo);
  clearBtn.addEventListener('click', () => { log = []; liveLog.innerHTML = ''; });

  downloadBtn.addEventListener('click', () => {
    if(log.length === 0){ alert('No log to download. Start demo and type to generate a sample.'); return; }
    const lines = log.map(l => `${l.time}\t${l.masked ? '[MASKED]' : l.key}\t${l.code}\t${l.type}`);
    const blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sample-demo-log.txt'; document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 3000);
  });

  window.addEventListener('beforeunload', stopDemo);
  setIndicator(false);
})();
