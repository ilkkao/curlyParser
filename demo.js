
$(document).ready(main);

function main() {
    $("#input").on('change keyup paste', function() {
        scan(getInput());
    });

    scan(getInput());
}

var parser = new CurlyParser();

function scan(input) {
    var output = [];

    var start = new Date().getTime();

    // Heavy lifting
    var treeAndErrors = parser.parse(input);

    var end = new Date().getTime();

    var time = end - start;
    $('#time').text('Execution time was ' + time + ' ms.');

    // All done. As an example, convert AST to plain JSON tree
    var ASTTree = treeAndErrors.tree;
    var errors = treeAndErrors.errors;

    ASTTree.traverse(function(node) {
        delete node.parent; // JSON.stingify below can't handle circles
    });

    $('#output').empty().text(JSON.stringify(ASTTree, undefined, 4));

    // Print possible syntax errors
    var errorText = '';

    errors.forEach(function(error, index) {
        errorText += 'ERROR #' + index + ': ' + error + '\n';
    });

    $('#errors').empty().prepend(errorText + '\n');
}

function getInput() {
    return $('#input').val();
}

function logError(text, output) {
    output.push({ type: 'error', value: text });
}
