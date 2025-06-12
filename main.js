const font = 'Slant';

figlet.defaults({ fontPath: 'https://cdn.jsdelivr.net/npm/figlet/fonts' });
figlet.preloadFonts([font], ready);

const formatter = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
});

const commands = {
    echo(...args) {
        this.echo(args.join(' '));
    },
    credits() {
        return [
            '',
            '<white>Used libraries:</white>',
            '* <a href="https://terminal.jcubic.pl">jQuery Terminal</a>',
            '* <a href="https://github.com/patorjk/figlet.js/">Figlet.js</a>',
            '* <a href="https://github.com/jcubic/isomorphic-lolcat">Isomorphic Lolcat</a>',
            '',
            '<a href="https://github.com/sponsors/jcubic">Sponsor ❤️ my Open Source work</a>',
            ''
        ].join('\n');
    },
    help() {
        this.echo(`List of available commands: ${help}`);
    }
};

const command_list = ['clear'].concat(Object.keys(commands));
const formatted_list = command_list.map(cmd => `<white class="command">${cmd}</white>`);
const help = formatter.format(formatted_list);

const term = $('body').terminal(commands, {
    completion: true,
    checkArity: false,
    greetings: false
});

term.on('click', '.command', function() {
   const command = $(this).text();
   term.exec(command, { typing: true, delay: 50 });
},, {
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

function ready() {
    const seed = rand(256);
    term.echo(() => rainbow(render('Firmament'), seed))
        .echo('<white>Welcome to Terminal Website Template</white>\n').resume();
}

const sound = new Audio('https://cdn.jsdelivr.net/gh/jcubic/static@master/assets/mech-keyboard-keystroke_3.mp3')

function rainbow(string, seed) {
    return lolcat.rainbow(function(char, color) {
        char = $.terminal.escape_brackets(char);
        return `[[;${hex(color)};]${char}]`;
    }, string, seed).join('\n');
}

function rand(max) {
    return Math.floor(Math.random() * (max + 1));
}

function render(text) {
    const cols = term.cols();
    return trim(figlet.textSync(text, {
        font: font,
        width: cols,
        whitespaceBreak: true
    }));
}

function trim(str) {
    return str.replace(/[\n\s]+$/, '');
}

function hex(color) {
    return '#' + [color.red, color.green, color.blue].map(n => {
        return n.toString(16).padStart(2, '0');
    }).join('');
}
