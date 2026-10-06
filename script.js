// random menu tag
var ROTATED_MSGS = [
    "Perfect School Game!",  
    "Made by Jacob Opilla!",
    "OBMC Tweaks is tuff...",
    "ADolore ad gloriam!",
    "We're finally public!",
    "High School Drama!",
    "Math sucks doesn't it?",
    "Hello from 10-Sapphire!",
    "I know you're bored...",
    "Glee, Dance, or Band?",
    "Homeworks suck right?!",
    "Bored? Play this now!",
    "Remember Data Files?",
    "Remember Scrapbooks?",
    "We all procrastinate!", 
    "Where did Story Mode go?",
    "Try the Gen Method!"
    
];
function setRandomTag() {
    var tag = document.getElementById("random-tag");
    if (!tag) return;
    tag.textContent = ROTATED_MSGS[Math.floor(Math.random() * ROTATED_MSGS.length)];
}
setRandomTag();

/*scale resolution*/
var zoomMultiplier = 1.0;
(function(){
    var GW=660,GH=720;
    function sc(){
        var base=Math.min(window.innerWidth/GW,window.innerHeight/GH,1);
        var s=Math.min(base*zoomMultiplier, window.innerWidth/GW, window.innerHeight/GH);
        document.getElementById("scale-root").style.transform="scale("+s+")";
        document.getElementById("scale-root").style.marginTop="0px";
    }
    window.addEventListener("resize",sc);
    window._applyScale=sc;
    sc();
})();

/*audio*/
var gameOverSound  = document.getElementById("gameover-sound");
var countdownSound = document.getElementById("countdown-sound");
var gameMusic      = document.getElementById("game-music");
var hardcoreMusic  = document.getElementById("hardcore-music");
var hitSound       = document.getElementById("hit-sound");
var clickSound     = document.getElementById("click-sound");
var menuMusic      = document.getElementById("menu-music");

/*master volume*/
function getMasterVolume() {
    if (settings.muted) return 0;
    return (settings.volume !== undefined ? settings.volume : 50) / 100;
}

function playAudio(audioEl, relativeVol) {
    audioEl.volume = getMasterVolume() * relativeVol;
    var p = audioEl.play();
    if (p && p.catch) p.catch(function(err){
        if (err.name !== 'AbortError') console.warn('Audio play blocked:', err.message);
    });
}

function applyMuteVolumes() {
    var mv = getMasterVolume();
    menuMusic.volume     = mv * 0.45;
    gameMusic.volume     = mv * 0.5;
    hardcoreMusic.volume = mv * 0.5;
    gameOverSound.volume = mv * 0.8;
    countdownSound.volume= mv * 0.7;
    hitSound.volume      = mv * 0.7;
    clickSound.volume    = mv * 0.6;

    var slider = document.getElementById('set-vol-slider');
    var label  = document.getElementById('set-vol-label');
    var row    = document.getElementById('set-vol-row');
    if (slider) slider.value = settings.volume !== undefined ? settings.volume : 50;
    if (label)  label.textContent = (settings.volume !== undefined ? settings.volume : 50) + '%';
    if (row) {
        row.style.opacity      = settings.muted ? '0.35' : '1';
        row.style.pointerEvents= settings.muted ? 'none'  : 'auto';
    }
}

// Live-update volume as slider moves
document.addEventListener('input', function(e){
    if (e.target.id === 'set-vol-slider') {
        settings.volume = parseInt(e.target.value);
        document.getElementById('set-vol-label').textContent = settings.volume + '%';
        saveSettings();
        applyMuteVolumes(); // updates all currently-playing audio elements
    }
});

function playMenuMusic() {
    if(!_menuMusicEnabled) return;
    if (menuMusic.paused) {
        menuMusic.volume = getMasterVolume() * 0.45;
        var p = menuMusic.play();
        if (p && p.catch) p.catch(function(err) {});
    }
}

function stopMenuMusic() { menuMusic.pause(); menuMusic.currentTime = 0; }

/*settings */
var DEFAULT_SETTINGS = {
    muted:false, hitbox:false, skipCountdown:false, screenShake:true,
    autoRestart:false, showInvFlash:true, showFps:false,
    scoreSize:'normal', btnSize:'normal', btnGap:'spread', zoom:'default',
    volume: 50,
    keybinds:{
        sp:{ left:'arrowleft', right:'arrowright' },
        p1:{ left:'a',         right:'d'          },
        p2:{ left:'arrowleft', right:'arrowright'  }
    }
};
var settings;
(function(){
    try {
        var s=JSON.parse(localStorage.getItem('galaxyblast_settings'));
        if(s && s.keybinds && s.keybinds.sp && s.keybinds.p1 && s.keybinds.p2){
            settings=Object.assign({},DEFAULT_SETTINGS,s);
            settings.keybinds=Object.assign({},DEFAULT_SETTINGS.keybinds,s.keybinds);
            if(!settings.zoom)settings.zoom='default';
        } else { settings=JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); }
    } catch(e){ settings=JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); }
})();
function saveSettings(){ try{ localStorage.setItem('galaxyblast_settings',JSON.stringify(settings)); }catch(e){} }

function normalizeKey(k){ return(typeof k==='string')?k.toLowerCase():k; }
function matchKey(p,b){ return normalizeKey(p)===normalizeKey(b); }
function keyLabel(k){
    var M={'arrowleft':'←','arrowright':'→','arrowup':'↑','arrowdown':'↓',' ':'Space','enter':'Enter',
           'backspace':'Bksp','tab':'Tab','delete':'Del','home':'Home','end':'End',
           'pageup':'PgUp','pagedown':'PgDn','insert':'Ins','escape':'Esc'};
    return M[normalizeKey(k)]||k.toUpperCase();
}

function applyHitbox(){
    var g=document.getElementById('game');
    settings.hitbox?g.classList.add('hitbox-on'):g.classList.remove('hitbox-on');
    document.querySelectorAll('.mp-game').forEach(function(e){ settings.hitbox?e.classList.add('hitbox-on'):e.classList.remove('hitbox-on'); });
}
function applyScoreSize(){
    ['hud-score','hud-best'].forEach(function(id){
        var e=document.getElementById(id); e.classList.remove('score-sm','score-lg');
        if(settings.scoreSize==='small')e.classList.add('score-sm');
        if(settings.scoreSize==='large')e.classList.add('score-lg');
    });
}
function applyFpsCounter(){ document.getElementById('fps-counter').style.display=settings.showFps?'block':'none'; }
function applyBtnSize(){ document.querySelectorAll('.mob-btn').forEach(function(b){ b.classList.remove('size-sm','size-lg'); if(settings.btnSize==='small')b.classList.add('size-sm'); if(settings.btnSize==='large')b.classList.add('size-lg'); }); }
function applyBtnGap(){ var mc=document.getElementById('mobile-controls'); mc.style.justifyContent=settings.btnGap==='center'?'center':'space-between'; mc.style.gap=settings.btnGap==='center'?'20px':'0px'; }

var ZOOM_VALS=['-3x','-2x','-1x','default'];
var ZOOM_MULTS={'-3x':0.25,'-2x':0.4,'-1x':0.7,'default':1.0};
function applyZoom(){ zoomMultiplier=ZOOM_MULTS[settings.zoom]||1.0; if(window._applyScale)window._applyScale(); }
function settingsCycleZoom(){
    var idx=ZOOM_VALS.indexOf(settings.zoom); if(idx===-1)idx=3;
    settings.zoom=ZOOM_VALS[(idx+1)%ZOOM_VALS.length];
    saveSettings(); applyZoom(); _updateZoomBtn();
}
function _updateZoomBtn(){ document.getElementById('set-zoom-btn').textContent=settings.zoom.toUpperCase(); }
function triggerShake(){
    if(!settings.screenShake)return;
    var g=document.getElementById('game');
    g.classList.remove('shaking'); void g.offsetWidth; g.classList.add('shaking');
    setTimeout(function(){ g.classList.remove('shaking'); },260);
}

var fpsFC=0,fpsLT=performance.now(),fpsInt=null;
function startFpsCounter(){
    if(fpsInt)clearInterval(fpsInt); fpsFC=0; fpsLT=performance.now();
    function tick(){ fpsFC++; requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
    fpsInt=setInterval(function(){
        var now=performance.now(),fps=Math.round(fpsFC/((now-fpsLT)/1000));
        fpsFC=0; fpsLT=now;
        var fc=document.getElementById('fps-counter'); if(fc)fc.textContent='FPS: '+fps;
    },500);
}
function stopFpsCounter(){ if(fpsInt){clearInterval(fpsInt);fpsInt=null;} var fc=document.getElementById('fps-counter'); if(fc)fc.textContent='FPS: --'; }

function settingsToggleSound(){ settings.muted=!settings.muted; saveSettings(); applyMuteVolumes(); _updateSoundBtn(); }
function settingsToggleHitbox(){ settings.hitbox=!settings.hitbox; saveSettings(); applyHitbox(); _updateHitboxBtn(); }
function settingsToggleSkipCd(){ settings.skipCountdown=!settings.skipCountdown; saveSettings(); _updateSkipCdBtn(); }
function settingsToggleShake(){ settings.screenShake=!settings.screenShake; saveSettings(); _updateShakeBtn(); }
function settingsToggleAutoRestart(){ settings.autoRestart=!settings.autoRestart; saveSettings(); _updateAutoRestartBtn(); }
function settingsToggleInvFlash(){ settings.showInvFlash=!settings.showInvFlash; saveSettings(); _updateInvFlashBtn(); }
function settingsToggleFps(){ settings.showFps=!settings.showFps; saveSettings(); applyFpsCounter(); _updateFpsBtn(); if(settings.showFps)startFpsCounter(); else stopFpsCounter(); }
var SCORE_SIZES=['normal','small','large'];
function settingsCycleScoreSize(){ settings.scoreSize=SCORE_SIZES[(SCORE_SIZES.indexOf(settings.scoreSize)+1)%3]; saveSettings(); applyScoreSize(); _updateScoreSizeBtn(); }
var BTNSIZE_VALS=['small','normal','large'];
function settingsCycleBtnSize(){ settings.btnSize=BTNSIZE_VALS[(BTNSIZE_VALS.indexOf(settings.btnSize)+1)%3]; saveSettings(); applyBtnSize(); _updateBtnSizeBtn(); }
var BTNGAP_VALS=['spread','center'];
function settingsCycleBtnGap(){ settings.btnGap=BTNGAP_VALS[(BTNGAP_VALS.indexOf(settings.btnGap)+1)%2]; saveSettings(); applyBtnGap(); _updateBtnGapBtn(); }

var _resetScoresConfirmPending=false, _resetScoresConfirmTimer=null;
function settingsResetBestScores(){
    var btn=document.getElementById('set-reset-scores-btn');
    var errEl=document.getElementById('settings-error');
    if(!_resetScoresConfirmPending){
        _resetScoresConfirmPending=true; btn.textContent='CONFIRM?'; btn.classList.add('confirmed');
        errEl.innerHTML='<span style="color:#ff8844;background:transparent;">⚠ Click again to confirm reset!</span>';
        _resetScoresConfirmTimer=setTimeout(function(){
            _resetScoresConfirmPending=false; btn.textContent='RESET SCORES'; btn.classList.remove('confirmed'); errEl.textContent='';
        },3000);
    } else {
        clearTimeout(_resetScoresConfirmTimer); _resetScoresConfirmPending=false;
        bestEasy=0; bestMed=0; bestHC=0;
        localStorage.removeItem('galaxyblast_best_easy'); localStorage.removeItem('galaxyblast_best_med'); localStorage.removeItem('galaxyblast_best_hc');
        document.getElementById('start-best-easy').textContent='0';
        document.getElementById('start-best-med').textContent='0';
        document.getElementById('start-best-hc').textContent='0';
        btn.textContent='RESET SCORES'; btn.classList.remove('confirmed');
        errEl.innerHTML='<span style="color:#0f0;background:transparent;">✔ Best scores cleared!</span>';
    }
}
function _updateSoundBtn(){ var b=document.getElementById('set-sound-btn'); settings.muted?(b.textContent='🔇 MUTED',b.classList.add('off')):(b.textContent='🔊 SOUND ON',b.classList.remove('off')); }
function _updateHitboxBtn(){ var b=document.getElementById('set-hitbox-btn'); settings.hitbox?(b.textContent='📦 HITBOX ON',b.classList.remove('off')):(b.textContent='📦 HITBOX OFF',b.classList.add('off')); }
function _updateSkipCdBtn(){ var b=document.getElementById('set-skipcd-btn'); settings.skipCountdown?(b.textContent='SKIP ON',b.classList.remove('off')):(b.textContent='SKIP OFF',b.classList.add('off')); }
function _updateShakeBtn(){ var b=document.getElementById('set-shake-btn'); settings.screenShake?(b.textContent='SHAKE ON',b.classList.remove('off')):(b.textContent='SHAKE OFF',b.classList.add('off')); }
function _updateAutoRestartBtn(){ var b=document.getElementById('set-autorestart-btn'); settings.autoRestart?(b.textContent='AUTO ON',b.classList.remove('off')):(b.textContent='AUTO OFF',b.classList.add('off')); }
function _updateInvFlashBtn(){ var b=document.getElementById('set-invflash-btn'); settings.showInvFlash?(b.textContent='FLICKER ON',b.classList.remove('off')):(b.textContent='FLICKER OFF',b.classList.add('off')); }
function _updateFpsBtn(){ var b=document.getElementById('set-fps-btn'); settings.showFps?(b.textContent='FPS ON',b.classList.remove('off')):(b.textContent='FPS OFF',b.classList.add('off')); }
function _updateScoreSizeBtn(){ document.getElementById('set-scoresize-btn').textContent=({normal:'NORMAL',small:'SMALL',large:'LARGE'})[settings.scoreSize]||'NORMAL'; }
function _updateBtnSizeBtn(){ document.getElementById('set-btnsize-btn').textContent=({small:'SMALL',normal:'NORMAL',large:'LARGE'})[settings.btnSize]||'NORMAL'; }
function _updateBtnGapBtn(){ document.getElementById('set-btnpos-btn').textContent=({spread:'SPREAD',center:'CENTER'})[settings.btnGap]||'SPREAD'; }
function _updateAllKbBtns(){
    document.getElementById('kb-sp-left').textContent =keyLabel(tempKeybinds.sp.left);
    document.getElementById('kb-sp-right').textContent=keyLabel(tempKeybinds.sp.right);
    document.getElementById('kb-p1-left').textContent =keyLabel(tempKeybinds.p1.left);
    document.getElementById('kb-p1-right').textContent=keyLabel(tempKeybinds.p1.right);
    document.getElementById('kb-p2-left').textContent =keyLabel(tempKeybinds.p2.left);
    document.getElementById('kb-p2-right').textContent=keyLabel(tempKeybinds.p2.right);
}
function updateSettingsUI(){
    _updateSoundBtn();_updateHitboxBtn();_updateSkipCdBtn();_updateShakeBtn();
    _updateAutoRestartBtn();_updateInvFlashBtn();_updateFpsBtn();
    _updateScoreSizeBtn();_updateBtnSizeBtn();_updateBtnGapBtn();_updateZoomBtn();_updateAllKbBtns();
    var rsb=document.getElementById('set-reset-scores-btn');
    rsb.textContent='RESET SCORES'; rsb.classList.remove('confirmed');
    _resetScoresConfirmPending=false; if(_resetScoresConfirmTimer){clearTimeout(_resetScoresConfirmTimer);_resetScoresConfirmTimer=null;}
    ['set-section-mobile','set-btnsize-row','set-btnpos-row'].forEach(function(id){
        var el=document.getElementById(id); if(el)el.style.display=isTouchDevice?(id==='set-section-mobile'?'block':'flex'):'none';
    });
    if(isTouchDevice){
        document.querySelectorAll('.set-kb').forEach(function(b){b.classList.add('locked');});
        document.getElementById('set-kb-mobile-note-sp').style.display='block';
        document.getElementById('set-kb-mobile-note-mp').style.display='block';
    } else {
        document.querySelectorAll('.set-kb').forEach(function(b){b.classList.remove('locked','listening');});
        document.getElementById('set-kb-mobile-note-sp').style.display='none';
        document.getElementById('set-kb-mobile-note-mp').style.display='none';
    }
    // sync volume slider to current settings
    applyMuteVolumes();
    var sc=document.getElementById('settings-scroll'); if(sc)sc.scrollTop=0;
}

var settingsOrigin='menu', listeningFor=null, tempKeybinds=null;
function openSettings(origin){
    settingsOrigin=origin||'menu'; listeningFor=null;
    if(origin==='sp-pause'){
        document.getElementById('game').style.display='none';
        document.getElementById('hud').style.display='none';
        document.getElementById('mobile-controls').style.display='none';
        showMobPauseBtn(false);
    } else if(origin==='mp-pause'){
        document.getElementById('mp-wrapper').style.display='none';
        showMobPauseBtn(false);
        document.getElementById('mp-vs-settings-btn').classList.remove('show');
        document.getElementById('mp-vs-quit-btn').classList.remove('show');
    } else { hideAll(); }
    tempKeybinds=JSON.parse(JSON.stringify(settings.keybinds));
    document.getElementById('settings-error').textContent='';
    updateSettingsUI();
    document.getElementById('settings').style.display='block';
}
function closeSettings(){
    var origin=settingsOrigin; settingsOrigin='menu'; listeningFor=null;
    document.querySelectorAll('.set-kb').forEach(function(b){b.classList.remove('listening');});
    document.getElementById('settings').style.display='none';
    if(origin==='sp-pause'){
        document.getElementById('game').style.display='block';
        document.getElementById('hud').style.display='flex';
        document.getElementById('game-backdrop').style.display='block';
        showMobileControls(true,mode); showMobPauseBtn(true,mode); updateMobPauseBtnState();
    } else if(origin==='mp-pause'){
        document.getElementById('mp-wrapper').style.display='flex';
        document.getElementById('game-backdrop').style.display='block';
        showMobPauseBtn(true,mode); updateMobPauseBtnState();
        document.getElementById('mp-vs-settings-btn').classList.add('show');
        document.getElementById('mp-vs-quit-btn').classList.add('show');
    } else { showStart(); }
}
function listenKey(section,dir){
    if(isTouchDevice)return;
    var btnId='kb-'+section+'-'+dir;
    if(listeningFor&&listeningFor.section===section&&listeningFor.dir===dir){
        document.getElementById(btnId).textContent=keyLabel(tempKeybinds[section][dir]);
        document.getElementById(btnId).classList.remove('listening'); listeningFor=null; return;
    }
    if(listeningFor){ var oi='kb-'+listeningFor.section+'-'+listeningFor.dir; document.getElementById(oi).textContent=keyLabel(tempKeybinds[listeningFor.section][listeningFor.dir]); document.getElementById(oi).classList.remove('listening'); }
    listeningFor={section:section,dir:dir};
    document.getElementById(btnId).textContent='...'; document.getElementById(btnId).classList.add('listening');
    document.getElementById('settings-error').textContent='';
}
function _handleListenKey(key){
    var REJECT=['Shift','Control','Alt','Meta','CapsLock','Tab','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'];
    if(REJECT.indexOf(key)!==-1)return;
    var nk=normalizeKey(key);
    if(nk==='p'){document.getElementById('settings-error').textContent='⚠ P is reserved for PAUSE!';return;}
    var s=listeningFor.section,d=listeningFor.dir,btnId='kb-'+s+'-'+d;
    tempKeybinds[s][d]=nk;
    document.getElementById(btnId).textContent=keyLabel(nk); document.getElementById(btnId).classList.remove('listening');
    listeningFor=null; document.getElementById('settings-error').textContent='';
}
function applySettings(){
    var spB=[{name:'SP Left',key:tempKeybinds.sp.left},{name:'SP Right',key:tempKeybinds.sp.right}];
    var mpB=[{name:'P1 Left',key:tempKeybinds.p1.left},{name:'P1 Right',key:tempKeybinds.p1.right},{name:'P2 Left',key:tempKeybinds.p2.left},{name:'P2 Right',key:tempKeybinds.p2.right}];
    var conflicts=[];
    function chk(g){for(var i=0;i<g.length;i++)for(var j=i+1;j<g.length;j++)if(normalizeKey(g[i].key)===normalizeKey(g[j].key))conflicts.push(g[i].name+' & '+g[j].name);}
    chk(spB);chk(mpB);
    var errEl=document.getElementById('settings-error');
    if(conflicts.length>0){errEl.innerHTML='<span style="color:#ff4444;background:transparent;">⚠ CONFLICT: '+conflicts.join(' · ')+'</span>';return;}
    settings.keybinds=JSON.parse(JSON.stringify(tempKeybinds)); saveSettings(); listeningFor=null;
    errEl.innerHTML='<span style="color:#0f0;background:transparent;">✔ Settings saved!</span>';
}
function resetSettingsDefaults(){
    settings=JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    tempKeybinds=JSON.parse(JSON.stringify(settings.keybinds)); listeningFor=null;
    saveSettings(); applyMuteVolumes(); applyHitbox(); applyScoreSize(); applyFpsCounter(); applyBtnSize(); applyBtnGap(); applyZoom(); updateSettingsUI();
    document.getElementById('settings-error').innerHTML='<span style="color:#0f0;background:transparent;">✔ Reset to defaults!</span>';
}

function stopAllMusic(){
    gameMusic.pause();gameMusic.currentTime=0;
    hardcoreMusic.pause();hardcoreMusic.currentTime=0;
    gameOverSound.pause();gameOverSound.currentTime=0;
    countdownSound.pause();countdownSound.currentTime=0;
}
var lastHitSoundTime=0;
function playHit(){ var now=Date.now();if(now-lastHitSoundTime<200)return;lastHitSoundTime=now; playAudio(hitSound,0.7); }
function playGameOver(){ stopAllMusic(); playAudio(gameOverSound,0.8); }
function playClick(){ playAudio(clickSound,0.6); }
function playGameMusic(){
    if(mode==='hardcore') playAudio(hardcoreMusic,0.5);
    else                  playAudio(gameMusic,0.5);
}

var isTouchDevice=(window.matchMedia&&window.matchMedia("(pointer: coarse)").matches)||("ontouchstart" in window)||(navigator.maxTouchPoints>0);
if(isTouchDevice){
    document.getElementById("mp-btn-sub").textContent="P1: ◤◥ corners  |  P2: ◣◢ corners";
}

/*game state*/
var msgs=["Nice try!","Better Luck Next Time!","Almost there!","Don't let Asher laugh at you!","Never Give up!","Lock in!"];
var hcMsgs=["TOO SLOW. ☠","PATHETIC.","THE FIRE WINS.","GET GOOD.","Asher is laughing. ☠"];
var mode="easy", gameType="single";
var bestEasy=parseInt(localStorage.getItem("galaxyblast_best_easy"))||0;
var bestMed =parseInt(localStorage.getItem("galaxyblast_best_med")) ||0;
var bestHC  =parseInt(localStorage.getItem("galaxyblast_best_hc"))  ||0;
document.getElementById("start-best-easy").textContent=bestEasy;
document.getElementById("start-best-med").textContent=bestMed;
document.getElementById("start-best-hc").textContent=bestHC;
var isPaused=false, mpIsPaused=false;
function saveScores(){ localStorage.setItem("galaxyblast_best_easy",bestEasy); localStorage.setItem("galaxyblast_best_med",bestMed); localStorage.setItem("galaxyblast_best_hc",bestHC); }

var mobPauseBtn=document.getElementById("mob-pause-btn");
function showMobPauseBtn(visible,m){
    if(visible&&isTouchDevice){
        mobPauseBtn.style.display="flex"; mobPauseBtn.classList.remove("hardcore","medium","paused");
        if(m==="hardcore")mobPauseBtn.classList.add("hardcore"); else if(m==="medium")mobPauseBtn.classList.add("medium");
    } else { mobPauseBtn.style.display="none"; }
}
function updateMobPauseBtnState(){ mobPauseBtn.textContent="⚙ SET"; (isPaused||mpIsPaused)?mobPauseBtn.classList.add("paused"):mobPauseBtn.classList.remove("paused"); }
function mobSettingsBtnTap(){
    if(gameType==="single"){ if(spDead||spCd)return; if(isPaused){spResume();}else{spPause();openSettings("sp-pause");} }
    else if(gameType==="multi"){ if(!mpState)return; if(mpIsPaused){mpResume();}else{mpPauseAll();openSettings("mp-pause");} }
}
mobPauseBtn.addEventListener("touchstart",function(e){e.preventDefault();mobSettingsBtnTap();},{passive:false});
mobPauseBtn.addEventListener("mousedown",function(){mobSettingsBtnTap();});

function spPause(){
    if(spDead||spCd)return; isPaused=true;
    spBlock.style.animationPlayState="paused"; spBlock2.style.animationPlayState="paused";
    spMeteor.style.animationPlayState="paused"; spMonster.style.animationPlayState="paused"; spMonster2.style.animationPlayState="paused";
    if(spScoreInt){clearInterval(spScoreInt);spScoreInt=null;}
    gameMusic.pause(); hardcoreMusic.pause();
    var pt=document.getElementById("pause-text"); pt.classList.remove("hardcore","medium");
    if(mode==="hardcore")pt.classList.add("hardcore"); else if(mode==="medium")pt.classList.add("medium");
    document.getElementById("pause-overlay").classList.add("visible"); updateMobPauseBtnState();
}
function spResume(){
    isPaused=false;
    spBlock.style.animationPlayState="running"; spBlock2.style.animationPlayState="running";
    spMeteor.style.animationPlayState="running"; spMonster.style.animationPlayState="running"; spMonster2.style.animationPlayState="running";
    spStartScore();
    playGameMusic();
    document.getElementById("pause-overlay").classList.remove("visible"); updateMobPauseBtnState();
}
function togglePause(){
    if(gameType==="single"){ if(spDead||spCd)return; if(isPaused)spResume();else spPause(); }
    else if(gameType==="multi"){ if(!mpState)return; if(mpIsPaused)mpResume();else mpPauseAll(); }
}
function mpPauseAll(){
    if(!mpState)return; mpIsPaused=true;
    if(mode==="hardcore")hardcoreMusic.pause(); else gameMusic.pause();
    mpState.forEach(function(p,idx){
        if(p.dead)return;
        p.obs.forEach(function(o){o.style.animationPlayState="paused";}); clearInterval(p.scoreInt);p.scoreInt=null;
        var pt=document.getElementById("mp-pause-text-"+(idx+1)); pt.classList.remove("hardcore","medium");
        if(mode==="hardcore")pt.classList.add("hardcore"); else if(mode==="medium")pt.classList.add("medium");
        document.getElementById("mp-pause-"+(idx+1)).classList.add("visible");
    });
    document.getElementById('mp-vs-settings-btn').classList.add('show');
    document.getElementById('mp-vs-quit-btn').classList.add('show'); updateMobPauseBtnState();
}
function mpResume(){
    if(!mpState)return; mpIsPaused=false;
    playGameMusic(); 
    mpState.forEach(function(p,idx){
        if(p.dead)return;
        p.obs.forEach(function(o){o.style.animationPlayState="running";});
        p.scoreInt=setInterval(function(){if(!p.dead&&!mpIsPaused){p.score++;p.scoreEl.textContent=p.score;}},300);
        document.getElementById("mp-pause-"+(idx+1)).classList.remove("visible");
    });
    document.getElementById('mp-vs-settings-btn').classList.remove('show');
    document.getElementById('mp-vs-quit-btn').classList.remove('show'); updateMobPauseBtnState();
}

var mobInterval=null;
function moveLeft(){ if(!isPaused&&spCharX>0){spCharX-=100;spChar.style.left=spCharX+"px";} }
function moveRight(){ if(!isPaused&&spCharX<500){spCharX+=100;spChar.style.left=spCharX+"px";} }
function mobDown(dir){
    if(spDead||isPaused||gameType!=="single")return;
    if(dir==="left")moveLeft();else moveRight();
    if(mobInterval)clearInterval(mobInterval);
    mobInterval=setInterval(function(){ if(spDead||isPaused){clearInterval(mobInterval);mobInterval=null;return;} if(dir==="left")moveLeft();else moveRight(); },160);
}
function mobUp(){ if(mobInterval){clearInterval(mobInterval);mobInterval=null;} }
(function(){
    var bL=document.getElementById("mob-left"),bR=document.getElementById("mob-right");
    function ae(btn,dir){
        btn.addEventListener("touchstart",function(e){e.preventDefault();mobDown(dir);},{passive:false});
        btn.addEventListener("touchend",function(e){e.preventDefault();mobUp();},{passive:false});
        btn.addEventListener("touchcancel",function(e){e.preventDefault();mobUp();},{passive:false});
        btn.addEventListener("mousedown",function(){mobDown(dir);});
        btn.addEventListener("mouseup",function(){mobUp();});
        btn.addEventListener("mouseleave",function(){mobUp();});
    }
    ae(bL,"left"); ae(bR,"right");
})();
function showMobileControls(visible,m){
    var mc=document.getElementById("mobile-controls");
    if(visible&&isTouchDevice&&gameType==="single"){
        mc.classList.remove("hardcore","medium"); if(m==="hardcore")mc.classList.add("hardcore"); else if(m==="medium")mc.classList.add("medium");
        mc.style.display="flex"; applyBtnGap();
    } else { mc.style.display="none"; }
}

function hideAll(){
    ["start","type-select","mode-select","hud","game","result","tutorial",
     "mp-wrapper","mp-result","mobile-controls","settings"]
    .forEach(function(id){ var el=document.getElementById(id); if(el){el.style.display="none";} });
    document.getElementById("game-backdrop").style.display="none";
    document.getElementById('mp-vs-settings-btn').classList.remove('show');
    document.getElementById('mp-vs-quit-btn').classList.remove('show');
    showMobPauseBtn(false); showMpMobileControls(false);
}
function quitToMenu(){ showStart(); }
function quitMpToMenu(){ showStart(); }
function showStart(){
    stopMp(); stopFpsCounter(); isPaused=false; mpIsPaused=false; stopAllMusic();
    bestEasy=parseInt(localStorage.getItem("galaxyblast_best_easy"))||0;
    bestMed =parseInt(localStorage.getItem("galaxyblast_best_med")) ||0;
    bestHC  =parseInt(localStorage.getItem("galaxyblast_best_hc"))  ||0;
    hideAll();
    document.getElementById("start").style.display="block";
    document.getElementById("start-best-easy").textContent=bestEasy;
    document.getElementById("start-best-med").textContent=bestMed;
    document.getElementById("start-best-hc").textContent=bestHC;
    setRandomTag();
    if(window._applyRainbowTitle) window._applyRainbowTitle();
    playMenuMusic();
}
function showTypeSelect(){ hideAll(); document.getElementById("type-select").style.display="block"; playMenuMusic(); }
function showClassicModeSelect(){ gameType='single'; hideAll(); document.getElementById("mode-select").style.display="block"; playMenuMusic(); }
function showMpModeSelect(){ gameType='multi'; hideAll(); document.getElementById("mode-select").style.display="block"; playMenuMusic(); }
function startTutorial(){ hideAll(); document.getElementById("tutorial").style.display="block"; playMenuMusic(); }

/*singleplayer*/
var spScore=0,spLives=3,spDead=false,spInv=false,spCd=false,spCharX=300;
var spChar   =document.getElementById("character");
var spBlock  =document.getElementById("block");
var spBlock2 =document.getElementById("block2");
var spMeteor =document.getElementById("meteor");
var spMonster=document.getElementById("monster");
var spMonster2=document.getElementById("monster2");
var spGame   =document.getElementById("game");

function spRandomizeObstaclePositions(){
    var cols=[0,100,200,300,400,500]; cols.sort(function(){return Math.random()-0.5;});
    spBlock.style.left=cols[0]+"px"; spMeteor.style.left=cols[1]+"px";
    spMonster.style.left=cols[2]+"px"; spBlock2.style.left=cols[3]+"px"; spMonster2.style.left=cols[4]+"px";
}

function beginGame(m){
    mode=m; isPaused=false;
    if(gameType==="multi"){beginMp(m);return;}
    spScore=0; spLives=m==="easy"?3:m==="medium"?2:1;
    spDead=false; spInv=false; spCd=false; spCharX=300;
    var ge=spGame,hu=document.getElementById("hud"),hs=document.getElementById("hud-score"),hb=document.getElementById("hud-best");
    [ge,hu,hs,hb].forEach(function(e){e.classList.remove("hardcore","medium");});
    if(m==="hardcore")[ge,hu,hs,hb].forEach(function(e){e.classList.add("hardcore");});
    else if(m==="medium")[ge,hu,hs,hb].forEach(function(e){e.classList.add("medium");});
    hideAll();
    ge.style.display="block"; hu.style.display="flex";
    document.getElementById("game-backdrop").style.display="block";
    showMobileControls(true,m); showMobPauseBtn(true,m); updateMobPauseBtnState();
    applyHitbox(); applyScoreSize(); applyFpsCounter(); applyBtnSize();
    document.getElementById("pause-overlay").classList.remove("visible");
    [spBlock,spBlock2,spMeteor,spMonster,spMonster2].forEach(function(o){o.style.animation="none";o.style.top="-1000px";});
    void spBlock.offsetWidth;
    spRandomizeObstaclePositions();
    spBlock.style.top="-120px"; spMeteor.style.top="-140px";
    spChar.style.left=spCharX+"px"; spUpdateHUD();
    stopMenuMusic();
    if(settings.skipCountdown)spStartAnims(); else spCountdown(spStartAnims);
    if(settings.showFps)startFpsCounter();
}

function spUpdateHUD(){
    document.getElementById("hud-score-val").textContent=spScore;
    var b=mode==="hardcore"?bestHC:mode==="medium"?bestMed:bestEasy;
    document.getElementById("hud-best-val").textContent=b;
    if(mode==="hardcore"){document.getElementById("hud-lives").innerHTML='<span style="color:red;font-size:10px;background:transparent;">☠ HARDCORE ☠</span>';return;}
    var max=mode==="easy"?3:2,h='';
    for(var i=0;i<max;i++)h+=i<spLives?(mode==="medium"?'<span class="heart-yellow" style="background:transparent;">♥</span>':'<span class="heart" style="background:transparent;">♥</span>'):'<span class="heart-empty" style="background:transparent;">♥</span>';
    document.getElementById("hud-lives").innerHTML=h;
}
function spFlash(){
    var f=document.getElementById("flash"); f.style.backgroundColor="red";
    f.style.opacity=mode==="hardcore"?"0.7":"0.45"; spChar.classList.add("hit"); triggerShake();
    setTimeout(function(){f.style.opacity="0";spChar.classList.remove("hit");},180);
}
function spHit(){
    if(spDead||isPaused||spCd)return; if(spInv)return;
    spFlash(); playHit();
    if(mode==="hardcore"){spEnd();return;}
    spLives--; spUpdateHUD();
    if(spLives<=0)spEnd();
    else{
        spInv=true; if(settings.showInvFlash)spChar.classList.add('inv');
        setTimeout(function(){spInv=false;spChar.classList.remove('inv');},mode==="medium"?500:700);
    }
}
function spEnd(){
    spDead=true; isPaused=false;
    document.getElementById("pause-overlay").classList.remove("visible");
    showMobPauseBtn(false); mobUp();
    if(spCollInt)clearInterval(spCollInt); if(spScoreInt)clearInterval(spScoreInt);
    stopFpsCounter(); playGameOver();
    if(mode==="hardcore"){if(spScore>bestHC)bestHC=spScore;}
    else if(mode==="medium"){if(spScore>bestMed)bestMed=spScore;}
    else{if(spScore>bestEasy)bestEasy=spScore;}
    saveScores();
    var b=mode==="hardcore"?bestHC:mode==="medium"?bestMed:bestEasy;
    document.getElementById("score").textContent=spScore; document.getElementById("best-display").textContent=b;
    document.getElementById("start-best-easy").textContent=bestEasy;
    document.getElementById("start-best-med").textContent=bestMed;
    document.getElementById("start-best-hc").textContent=bestHC;
    var ri=document.getElementById("result"),bl=document.getElementById("best-line"),rb=document.getElementById("restart-btn"),qb=document.getElementById("quit-btn");
    ri.classList.remove("hardcore","medium"); rb.classList.remove("hc-btn","med-btn"); qb.classList.remove("hc-btn","med-btn");
    rb.textContent='↺ Restart'; qb.textContent='✕ Quit'; qb.onclick=function(){showStart();};
    if(mode==="hardcore"){
        ri.classList.add("hardcore"); document.getElementById("result-title").style.color="red";
        document.getElementById("result-title").textContent='GAME OVER';
        bl.style.color="#ff4444"; rb.classList.add("hc-btn"); qb.classList.add("hc-btn");
        document.getElementById("random-msg").textContent=hcMsgs[Math.floor(Math.random()*hcMsgs.length)];
    } else {
        document.getElementById("result-title").textContent='GAME OVER';
        document.getElementById("result-title").style.color="rgb(231,15,15)"; bl.style.color="#ff0";
        document.getElementById("random-msg").textContent=msgs[Math.floor(Math.random()*msgs.length)];
    }
    document.getElementById("mobile-controls").style.display="none";
    spGame.style.display="none"; document.getElementById("hud").style.display="none";
    if(settings.autoRestart)setTimeout(function(){restartGame();},1200);
    else document.getElementById("result").style.display="block";
}

var SP_CHAR_MID=450-30-100+50, spCollInt=null;
function spGetCol(px){return Math.round(parseInt(px)/100);}

function spStartCollision(){
    if(spCollInt)clearInterval(spCollInt);
    spCollInt=setInterval(function(){
        if(spDead||spInv||isPaused||gameType!=="single")return;
        var obs=[{el:spBlock,offset:50},{el:spMeteor,offset:60},{el:spMonster,offset:60}];
        var cc=spGetCol(spCharX);
        for(var i=0;i<obs.length;i++){
            var o=obs[i],oc=spGetCol(o.el.style.left),om=parseFloat(window.getComputedStyle(o.el).top)+o.offset;
            if(cc===oc&&Math.abs(om-SP_CHAR_MID)<38){spHit();break;}
        }
    },16);
}
var spScoreInt=null;
function spStartScore(){
    if(spScoreInt)clearInterval(spScoreInt);
    spScoreInt=setInterval(function(){if(!spDead&&!spInv&&!spCd&&!isPaused&&gameType==="single"){spScore++;spUpdateHUD();}},300);
}
function spCountdown(cb){
    spCd=true; countdownSound.currentTime=0; playAudio(countdownSound,0.7);
    var cd=document.getElementById("countdown"); cd.style.display="block";
    cd.style.color=mode==="medium"?"#ff0000":"red";
    var n=3; cd.textContent=n;
    var t=setInterval(function(){
        n--; if(n>0)cd.textContent=n;
        else if(n===0)cd.textContent=mode==="hardcore"?"DIE.":"GO!";
        else{clearInterval(t);cd.style.display="none";spCd=false;cb();}
    },1000);
}
function spStartAnims(){
    var sp=mode==="hardcore"?["0.55s","0.48s","0.52s"]:mode==="medium"?["0.8s","0.75s","0.8s"]:["1.1s","1.0s","1.0s"];
    spMeteor.style.animation="meteor "+sp[0]+" infinite linear";
    spBlock.style.animation="slide "+sp[1]+" infinite linear";
    spMonster.style.animation="monster "+sp[2]+" infinite linear";
    spBlock2.style.top="-1000px"; spMonster2.style.top="-1000px";
    playGameMusic(); 
    spStartCollision(); spStartScore();
}
[spBlock,spBlock2,spMeteor,spMonster,spMonster2].forEach(function(el){
    el.addEventListener("animationiteration",function(){ el.style.left=(Math.floor(Math.random()*6)*100)+"px"; if(el===spBlock)spUpdateHUD(); });
});

function restartGame(){
    stopAllMusic(); stopFpsCounter(); document.getElementById("result").style.display="none";
    beginGame(mode);
}

/*multiplayer*/
var MP_COLS=5,MP_STEP=52,MP_MID=2,mpState=null;
function mpSpeeds(m){ if(m==="hardcore")return["0.65s","0.7s","0.72s"]; if(m==="medium")return["0.8s","0.85s","0.9s"]; return["1.1s","1.2s","1.3s"]; }
function mpMakeObs(gameEl,col,dur,delay){
    var img=document.createElement("img"); img.className="mp-obs";
    img.src="http://vignette3.wikia.nocookie.net/touken-ranbu/images/8/8b/Fire_gif.gif/revision/latest?cb=20150511021654f";
    img.width=44;img.height=55;img.style.left=(col*MP_STEP+4)+"px";img.style.top="-60px";img.style.position="absolute";
    img.style.animationName="mp-fall";img.style.animationDuration=dur;img.style.animationDelay=delay;
    img.style.animationIterationCount="infinite";img.style.animationTimingFunction="linear";img.style.animationPlayState="paused";img.style.zIndex="8";
    gameEl.insertBefore(img,gameEl.firstChild); return img;
}
function mpMakePlayer(n){
    var maxL=mode==="easy"?3:mode==="medium"?2:1;
    return{n:n,gameEl:document.getElementById("mp-game-"+n),charEl:document.getElementById("mp-char-"+n),flashEl:document.getElementById("mp-flash-"+n),deadEl:document.getElementById("mp-dead-"+n),deadScEl:document.getElementById("mp-dead-sc-"+n),scoreEl:document.getElementById("mp-score-"+n),livesEl:document.getElementById("mp-lives-"+n),col:MP_MID,score:0,lives:maxL,invincible:false,dead:false,obs:[],obsCol:[],collInt:null,scoreInt:null};
}
function mpUpdateLives(p){
    if(mode==="hardcore"){p.livesEl.innerHTML='<span style="color:red;font-size:8px;background:transparent;">☠ HC</span>';return;}
    var max=mode==="easy"?3:2,h='';
    for(var i=0;i<max;i++)h+=i<p.lives?(mode==="medium"?'<span style="color:#ffd700;background:transparent;">♥</span>':'<span style="color:red;background:transparent;">♥</span>'):'<span style="color:#444;background:transparent;">♥</span>';
    p.livesEl.innerHTML=h;
}
function mpFlash(p){ p.flashEl.style.opacity=mode==="hardcore"?"0.7":"0.45"; p.charEl.classList.add("hit"); triggerShake(); setTimeout(function(){p.flashEl.style.opacity="0";p.charEl.classList.remove("hit");},180); }
function mpHit(p){
    if(p.dead||mpIsPaused)return; if(p.invincible)return;
    mpFlash(p); playHit();
    if(mode==="hardcore"){mpKill(p);return;}
    p.lives--;mpUpdateLives(p);
    if(p.lives<=0)mpKill(p);
    else{p.invincible=true;if(settings.showInvFlash)p.charEl.classList.add('inv');setTimeout(function(){p.invincible=false;p.charEl.classList.remove('inv');},mode==="medium"?500:700);}
}
function mpKill(p){
    p.dead=true; clearInterval(p.scoreInt);clearInterval(p.collInt);
    p.obs.forEach(function(o){o.style.animationPlayState="paused";});
    p.deadScEl.textContent="SCORE: "+p.score; p.deadEl.classList.add("show");
    if(mpState&&mpState[0].dead&&mpState[1].dead){playGameOver();setTimeout(showMpResult,900);}
}
function mpStartPlayer(p){
    if(p.n===1) playGameMusic();
    var sp=mpSpeeds(mode),stagger=["0s","0.4s","0.8s"];
    for(var i=0;i<3;i++){var col=Math.floor(Math.random()*MP_COLS);var el=mpMakeObs(p.gameEl,col,sp[i],stagger[i]);p.obs.push(el);p.obsCol.push(col);}
    p.obs.forEach(function(el,i){el.addEventListener("animationiteration",function(){if(mpIsPaused)return;var c=Math.floor(Math.random()*MP_COLS);p.obsCol[i]=c;el.style.left=(c*MP_STEP+4)+"px";});});
    p.obs.forEach(function(el){el.style.top="-60px";el.style.animationPlayState="running";});
    var CHAR_MID=(420-52-35)+26;
    p.collInt=setInterval(function(){
        if(p.dead||p.invincible||mpIsPaused)return;
        for(var i=0;i<p.obs.length;i++){var ot=parseFloat(window.getComputedStyle(p.obs[i]).top),om=ot+27;if(p.obsCol[i]===p.col&&Math.abs(om-CHAR_MID)<36){mpHit(p);break;}}
    },16);
    p.scoreInt=setInterval(function(){if(!p.dead&&!mpIsPaused){p.score++;p.scoreEl.textContent=p.score;}},300);
}
function mpCountdown(p,cb){
    if(settings.skipCountdown){cb();return;}
    var cd=document.getElementById("mp-cd-"+p.n); cd.style.display="block"; cd.style.color=mode==="medium"?"#ffd700":"red";
    if(p.n===1){countdownSound.currentTime=0; playAudio(countdownSound,0.7);}
    var n=3; cd.textContent=n;
    var t=setInterval(function(){n--;if(n>0)cd.textContent=n;else if(n===0)cd.textContent=mode==="hardcore"?"DIE.":mode==="medium"?"GO!":"GO!";else{clearInterval(t);cd.style.display="none";cb();}},1000);
}
function showMpResult(){
    ["start","type-select","mode-select","hud","game","tutorial","mp-wrapper"].forEach(function(id){document.getElementById(id).style.display="none";});
    document.getElementById('mp-vs-settings-btn').classList.remove('show');
    document.getElementById('mp-vs-quit-btn').classList.remove('show'); showMobPauseBtn(false); showMpMobileControls(false);
    var p1=mpState[0],p2=mpState[1],title=document.getElementById("mp-result-title"),w,c;
    if(p1.score>p2.score){w="P1 WINS!";c="#a0f0ff";}else if(p2.score>p1.score){w="P2 WINS!";c="#ffdb70";}else{w="IT'S A TIE!";c="#f0f";}
    title.textContent=w;title.style.color=c;title.style.textShadow="0 0 20px "+c;
    document.getElementById("mpr-sub").textContent="DIFFICULTY: "+mode.toUpperCase();
    document.getElementById("mpr-scrs").innerHTML='P1 Score: <span style="color:#0ff;background:transparent;">'+p1.score+'</span><br>P2 Score: <span style="color:#ffd700;background:transparent;">'+p2.score+'</span>';
    document.getElementById("mp-result").style.display="block";
}
function beginMp(m){
    mode=m;mpIsPaused=false;stopMp();
    var cls=m==="hardcore"?"hardcore":m==="medium"?"medium":"";
    [1,2].forEach(function(n){
        ["mp-game-"+n,"mp-hud-"+n,"mp-hs-"+n].forEach(function(id){var e=document.getElementById(id);e.classList.remove("hardcore","medium");if(cls)e.classList.add(cls);});
        document.getElementById("mp-dead-"+n).classList.remove("show");
        document.getElementById("mp-pause-"+n).classList.remove("visible");
        Array.from(document.querySelectorAll("#mp-game-"+n+" .mp-obs")).forEach(function(o){o.remove();});
        document.getElementById("mp-score-"+n).textContent="0";
    });
    var p1=mpMakePlayer(1),p2=mpMakePlayer(2); mpState=[p1,p2];
    p1.charEl.style.left=(MP_MID*MP_STEP)+"px"; p2.charEl.style.left=(MP_MID*MP_STEP)+"px";
    mpUpdateLives(p1);mpUpdateLives(p2);
    stopMenuMusic();
    hideAll(); document.getElementById("mp-wrapper").style.display="flex"; document.getElementById("game-backdrop").style.display="block";
    applyHitbox(); showMobPauseBtn(true,m); updateMobPauseBtnState(); showMpMobileControls(true);
    document.getElementById('mp-vs-settings-btn').classList.remove('show');
    document.getElementById('mp-vs-quit-btn').classList.remove('show');
    mpCountdown(p1,function(){mpStartPlayer(p1);}); mpCountdown(p2,function(){mpStartPlayer(p2);});
    if(settings.showFps)startFpsCounter();
}
function stopMp(){
    if(!mpState)return;
    mpState.forEach(function(p){if(!p)return;clearInterval(p.scoreInt);clearInterval(p.collInt);if(p.obs)p.obs.forEach(function(o){o.style.animationPlayState="paused";});});
    mpState=null; stopFpsCounter();
}
function restartMp(){ stopAllMusic(); document.getElementById("mp-result").style.display="none"; beginMp(mode); }

/*shared mp movement - used by keyboard AND the mobile corner buttons*/
function mpMoveLeft(p){ if(!p||p.dead||mpIsPaused)return; if(p.col>0){p.col--;p.charEl.style.left=(p.col*MP_STEP)+"px";} }
function mpMoveRight(p){ if(!p||p.dead||mpIsPaused)return; if(p.col<MP_COLS-1){p.col++;p.charEl.style.left=(p.col*MP_STEP)+"px";} }

function showMpMobileControls(visible){
    var mc=document.getElementById("mp-mob-controls");
    if(!mc)return;
    mc.style.display=(visible&&isTouchDevice&&gameType==="multi")?"block":"none";
}
(function(){
    var map=[["mp-mob-left-1",1,"left"],["mp-mob-right-1",1,"right"],["mp-mob-left-2",2,"left"],["mp-mob-right-2",2,"right"]];
    map.forEach(function(entry){
        var btn=document.getElementById(entry[0]); if(!btn)return;
        var pn=entry[1],dir=entry[2];
        function fire(){ if(!mpState)return; var p=mpState[pn-1]; if(dir==="left")mpMoveLeft(p);else mpMoveRight(p); }
        btn.addEventListener("touchstart",function(e){e.preventDefault();btn.classList.add("pressed");fire();},{passive:false});
        btn.addEventListener("touchend",function(e){e.preventDefault();btn.classList.remove("pressed");},{passive:false});
        btn.addEventListener("touchcancel",function(e){e.preventDefault();btn.classList.remove("pressed");},{passive:false});
        btn.addEventListener("mousedown",function(){btn.classList.add("pressed");fire();});
        btn.addEventListener("mouseup",function(){btn.classList.remove("pressed");});
        btn.addEventListener("mouseleave",function(){btn.classList.remove("pressed");});
    });
})();

document.addEventListener("keydown",function(e){
    if(listeningFor!==null){
        e.preventDefault();
        if(e.key==='Escape'){var s=listeningFor.section,d=listeningFor.dir;document.getElementById('kb-'+s+'-'+d).textContent=keyLabel(tempKeybinds[s][d]);document.getElementById('kb-'+s+'-'+d).classList.remove('listening');listeningFor=null;return;}
        _handleListenKey(e.key);return;
    }
    if(e.key==="p"||e.key==="P"){togglePause();return;}
    if(isPaused||mpIsPaused)return;
    if(gameType==="single"&&!spDead){
        var kb=settings.keybinds.sp;
        if(matchKey(e.key,kb.left)){e.preventDefault();moveLeft();}
        if(matchKey(e.key,kb.right)){e.preventDefault();moveRight();}
    }
    if(gameType==="multi"&&mpState){
        var p1=mpState[0],p2=mpState[1],kb1=settings.keybinds.p1,kb2=settings.keybinds.p2;
        if(matchKey(e.key,kb1.left)){e.preventDefault();mpMoveLeft(p1);}
        if(matchKey(e.key,kb1.right)){e.preventDefault();mpMoveRight(p1);}
        if(matchKey(e.key,kb2.left)){e.preventDefault();mpMoveLeft(p2);}
        if(matchKey(e.key,kb2.right)){e.preventDefault();mpMoveRight(p2);}
    }
});

/*init*/
applyMuteVolumes(); applyHitbox(); applyScoreSize(); applyFpsCounter(); applyBtnSize(); applyBtnGap(); applyZoom();
if(settings.showFps)startFpsCounter();

var _menuMusicEnabled = false;
function toggleMenuMusicBtn(){
    var btn = document.getElementById('menu-music-btn');
    if(_menuMusicEnabled){
        _menuMusicEnabled = false; stopMenuMusic();
        btn.style.color = '#555'; btn.style.borderColor = '#333';
    } else {
        _menuMusicEnabled = true; playMenuMusic();
        btn.style.color = '#0ff'; btn.style.borderColor = '#0ff';
    }
}

document.addEventListener("click",function(e){if(e.target.tagName==="BUTTON")playClick();});