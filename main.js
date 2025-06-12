const scanlines = $('.scanlines');
const tv = $('.tv');
function exit() {
    $('.tv').addClass('collapse');
    term.disable();
}

// ref: https://stackoverflow.com/q/67322922/387194
let __EVAL = (s) => eval(`void (__EVAL = ${__EVAL}); ${s}`);
const sound = new Audio('https://cdn.jsdelivr.net/gh/jcubic/static@master/assets/mech-keyboard-keystroke_3.mp3')

const term = $('#terminal').terminal(function(command, term) {
    const cmd = $.terminal.parse_command(command);
    if (cmd.name === 'exit') {
        exit();
    } else if (cmd.name === 'echo') {
        term.echo(cmd.rest);
    } else if (command !== '') {
        try {
            var result = __EVAL(command);
            if (result && result instanceof $.fn.init) {
                term.echo('<#jQuery>');
            } else if (result && typeof result === 'object') {
                tree(result);
            } else if (result !== undefined) {
                term.echo(new String(result));
            }
        } catch(e) {
            term.error(new String(e));
        }
    }
}, {
    name: 'js_demo',
    onResize: set_size,
    exit: false,
    // detect iframe codepen preview
    enabled: $('body').attr('onload') === undefined,
    keydown() {
        sound.play();
    },
    onInit: function() {
        set_size();
        this.echo('Type [[b;#fff;;command]exit] to see turn off animation.');
        this.echo('Type and execute [[b;#fff;;command]grab()] function to get the scre' +
                  'enshot from your camera');
        this.echo('Type [[b;#fff;;command]camera()] to get video and [[b;#fff;;command]pause()]/[[b;#fff;;command]play()] to stop/play');
    },
    prompt: 'js> '
});

term.on('click', '.command', function() {
    const command = $(this).data('text');
    term.exec(command, { typing: 100 });
});

// for codepen preview
if (!term.enabled()) {
    term.find('.cursor').addClass('blink');
}
function set_size() {
    // for window height of 170 it should be 2s
    const height = $(window).height();
    const width = $(window).width()
    const time = (height * 2) / 170;
    scanlines[0].style.setProperty("--time", time);
    tv[0].style.setProperty("--width", width);
    tv[0].style.setProperty("--height", height);
}

function tree(obj) {
    term.echo(treeify.asTree(obj, true, true));
}
var constraints = {
    audio: false,
    video: {
        width: { ideal: 1280 },
        height: { ideal: 1024 },
        facingMode: "environment"
    }
};
var acceptStream = (function() {
    return 'srcObject' in document.createElement('video');
})();
function camera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        term.pause();
        const media = navigator.mediaDevices.getUserMedia(constraints);
        media.then(function(mediaStream) {
            term.resume();
            let stream;
            if (!acceptStream) {
                stream = window.URL.createObjectURL(mediaStream);
            } else {
                stream = mediaStream;
            }
            term.echo('<video data-play="true" class="self"></video>', {
                raw: true,
                onClear: function() {
                    if (!acceptStream) {
                        URL.revokeObjectURL(stream);
                    }
                    mediaStream.getTracks().forEach(track => track.stop());
                },
                finalize: function(div) {
                    const video = div.find('video');
                    if (!video.length) {
                        return;
                    }
                    if (acceptStream) {
                        video[0].srcObject = stream;
                    } else {
                        video[0].src = stream;
                    }
                    if (video.data('play')) {
                        video[0].play();
                    }
                }
            });
        });
    }
}
var play = function() {
    const video = term.find('video').slice(-1);
    if (video.length) {
        video[0].play();
    }
}
function pause() {
    term.find('video').each(function() {
        this.pause(); 
    });
}

function grab() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        term.pause();
        const media = navigator.mediaDevices.getUserMedia(constraints);
        media.then(function(mediaStream) {
            const mediaStreamTrack = mediaStream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(mediaStreamTrack);
            return imageCapture.takePhoto();
        }).then(function(blob) {
            term.echo('<img src="' + URL.createObjectURL(blob) + '" class="self"/>', {
                raw: true,
                finialize: function(div) {
                    div.find('img').on('load', function() {
                        URL.revokeObjectURL(this.src);
                    });
                }
            }).resume();
        }).catch(function(error) {
            term.error('Device Media Error: ' + error);
        });
    }
}
async function pictuteInPicture() {
    const [video] = $('video');
    try {
        if (video) {
            if (video !== document.pictureInPictureElement) {
                await video.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        }
  } catch(error) {
      term.error(error);
  }
}
function clear() {
    term.clear();
}

github('jcubic/jquery.terminal');
cssVars(); // ponyfill
