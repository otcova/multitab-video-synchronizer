function send(data) {
  if (!chrome.runtime?.id)
    return; // Context invalidated
  chrome.runtime.sendMessage(data);
}

function log(...data) {
  if (data.length == 1)
    send({ log: data[0] });
  else
    send({ log: data });
}

let offset = 0;
configGetOffset();
function configGetOffset() {
  chrome.storage.local.get("offset").then(result => {
    offset = Number(result.offset) || 0;
  });
  return offset;
}

let isThisPrimary = 0;
function thisOffset() {
  if (isThisPrimary > 0) return configGetOffset();
  return 0;
}

function simplifyObject(event, toPrint = false) {
  let plain = {};
  for (key in event) {
    let value = event[key];

    if (typeof value == 'string')
      plain[key] = value;
    else if (typeof value == 'number')
      plain[key] = value;
    else if (toPrint) {
      if (value instanceof Window)
        plain[key] = "<#window>";
      else if (value instanceof Node)
        plain[key] = `<${value.nodeName} id='${value.id}' class='${value.className}'>`;
      else if (typeof value == 'object')
        plain[key] = JSON.stringify(value);
      else
        plain[key] = typeof value;
    }
  }
  return plain
}


function getVideo() {
  const videos = document.getElementsByTagName("video");
  if (videos.length > 0) return videos[0];
  return null;
}

function getTotalDuration() {
  const video = getVideo();
  if (!video) return 0;
  return Number(video.duration) || 0;
}

function getTime() {
  const video = getVideo();
  if (!video) return 0;
  time = Number(video.currentTime) || 0;
  log("Get Time with Offet: ", thisOffset());
  return time + thisOffset();
}

function setTime(time) {
  const video = getVideo();
  if (!video) return;
  time = Number(time) - thisOffset();
  log("Set Time with Offet: ", thisOffset());
  video.currentTime = time.toString();
}

function isPlaying() {
  const video = getVideo();
  if (!video) return false;
  return !video.paused;
}

// function getTimeBarElement() {
//   let total = document.getElementsByClassName('jw-timesegment-bar jw-rail jw-timesegment-background jw-reset')[0];
//   let progress = document.getElementsByClassName('jw-timesegment-bar jw-progress jw-timesegment-progress jw-reset')[0];
//   return { total, progress };
// }


// function getPercentage() {
//   let bar = getTimeBarElement();
//   return bar.progress.clientWidth / bar.total.clientWidth;
// }

// function isPlaying() {
//   /*
//   let playButton = document.getElementsByClassName('jw-svg-icon jw-svg-icon-play')[0];
//   if (!playButton)
//     return false;
//   let playButtonDisplay = getComputedStyle(playButton)?.display ?? "none";
//   return playButtonDisplay == "none";*/
//   return !document.getElementsByTagName("video")[0].paused;
// }

// function setPercentage(percentage) {
//   let bar = getTimeBarElement();

//   let x = percentage * bar.total.clientWidth;
//   let clientX = Math.round(x + bar.total.getBoundingClientRect().left);

//   let data = {
//     bubbles: true,
//     button: 0,
//     buttons: 1,
//     clientX,
//     ctrlKey: false,
//     type: "click",
//     which: 1,
//   };

//   bar.total.dispatchEvent(new MouseEvent('click', data));
//   document.getElementsByTagName("video")[0].focus();
// }

function setup() {
  if (!document.URL.includes("embed")) {
    log("dissabled at " + document.URL);
    return;
  }

  log("Running at " + document.URL);

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    isThisPrimary -= 1;
    if (message.keyboardEvent) {
      if (!message.response)
        return;

      let event = message.keyboardEvent;
      event.repeat = true;
      document.activeElement.dispatchEvent(new KeyboardEvent(event.type, event));
    } else if (message.sync) {
      setTime(message.sync);
    } else if (message.setPlay !== undefined) {
      if (isPlaying() != message.setPlay)
        document.getElementsByTagName("video")[0].click();
    } else {
      log("Unknown message: ", message);
    }
  });

  document.addEventListener('keydown', event => {
    isThisPrimary = 6; // Cooldown
    if (event.repeat) return;
    if (event.code == 'KeyF') return;

    if (event.code == 'KeyS') {
      send({ sync: getTime() })
      send({ setPlay: isPlaying() })
    } else if (event.code == 'KeyP') {
      let setPlay = !isPlaying();
      send({ setPlay });
      if (!setPlay)
        send({ sync: getTime() });
    } else if (event.code == 'Space') {
      let setPlay = isPlaying();
      send({ setPlay });
      if (!setPlay)
        send({ sync: getTime() });
    } else {
      send({ keyboardEvent: simplifyObject(event) });
    }
  });

  /*
  document.addEventListener('click', event => {
    let target = event.target;

    if (target instanceof Element) {
      log({
        event: simplifyObject(event, true),
        childs: target.children.length,
        inner: target.innerHTML,
        width: target.clientWidth,
        height: target.clientHeight,
        parentWidth: target.parentElement.clientWidth,
        parentHeight: target.parentElement.clientHeight,
      });
    }
  });
  */
}

document.addEventListener('DOMContentLoaded', () => {
  let inside_iframe = window !== top
  if (inside_iframe)
    setup()
});

