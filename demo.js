
$(document).ready(main);

function main() {
    $("#input").on('change keyup paste', function() {
        scan(getInput());
    });

    scan(getInput());
}

var scanner = new CurlyScanner();
var parser = new CurlyParser();

function scan(input) {
    var start = new Date().getTime();
    var output = [];
    var token;
    var tokens = [];

    // Phase 1: Scanning

    scanner.setInput(input);

    while(1) {
        try {
           token = scanner.scan();
        } catch (e) {
            logError(e, output)
        }

        if (token) {
            tokens.push(token);
        } else {
            break;
        }
    }

    // Phase 2: Parsing

    var tree = parser.parse(tokens);

    var end = new Date().getTime();

    var time = end - start;
    $('#time').text('Execution time was ' + time + ' ms.');

    // All done. As an example, convert AST to plain JSON tree

    removeLoops(tree);
    $('#output').text(JSON.stringify(tree, undefined, 4));

    // Print possible syntax errors
    var errors = '';

    output.forEach(function(error, index) {
        errors += 'ERROR #' + index + ': ' + error.value + '\n';
    });

    if (output.length > 0) {
        $('#output').prepend(errors + '\n');
    }
}

function removeLoops(node) {
    if (!node) {
        return;
    }

    delete node.parent; // JSON.stringify can't handle circles

    if (node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
            removeLoops(node.children[i]);
        }
    } else {
        delete node.children;
    }
}

function getInput() {
    return $('#input').val();
}

function logError(text, output) {
    output.push({ type: 'error', value: text });
}
