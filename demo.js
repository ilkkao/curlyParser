
$(document).ready(main);

function main() {
    $("#input").on('change keyup paste', function() {
        scan(getInput());
    });

    scan(getInput());
}

var scanner = new CurlyScanner();

function scan(input) {
    var start = new Date().getTime();
    var output = [];
    var token;

    scanner.setInput(input);

    while(1) {
        try {
           token = scanner.scan();
        } catch (e) {
            logError(e, output)
        }

        if (token) {
            logToken(token, output);
        } else {
            break;
        }
    }

    var end = new Date().getTime();

    var time = end - start;
    $('#time').text('Execution time was ' + time + ' ms.');

    printOutput(output);
}

function getInput() {
    return $('#input').val();
}

function logToken(data, output) {
    output.push({ type: 'token', value: data });
}

function logError(text, output) {
    output.push({ type: 'error', value: text });
}

function printOutput(output) {
    var logLine = 0;

    $('#output').empty();

    output.forEach(function(data) {
        var el = document.createElement('div');
        var firstChild = document.createElement('div');

        if (data.type === 'token') {
            var token = data.value;
            var indent = ''
            if (token.name !== 'CURLY_TAG_START' &&
                token.name !== 'CURLY_ESCAPE_CURLY' &&
                token.name !== 'CURLY_TAG_END' &&
                token.name !== 'HTML_STRING') {
                indent = '  ';
            }

            $(firstChild).text((logLine < 10 ? '0' : '' ) + logLine + ': ' + indent + '[' + token.name + ']');
            $(el).append(firstChild);

            if (token.value) {
                var secondChild = document.createElement('div');
                $(secondChild).text('"' + token.value + '"');
                $(el).append(secondChild);
            }

            logLine++;
        } else {
            $(el).text(data.value);
        }

        $(el).addClass('myclearfix ' + (data.type === 'token' ? 'info' : 'error'));

        if (data.value.name === 'HTML_STRING') {
            $(el).addClass('html');
        }

        $('#output').append(el);
    });
}