
$(document).ready(function main() {
    $("#input").on('change keyup paste', function() {
        scan(getInput());
    });

    scan(getInput());
});

var parser = new CurlyParser();

function scan(input) {
    var start = new Date().getTime();

    // Heavy lifting
    var treeAndErrors = parser.parse(input);

    var ASTTree = treeAndErrors.tree;
    var errors = treeAndErrors.errors;

    var end = new Date().getTime();

    $('#time').text('Execution time was ' + (end - start) + ' ms.');

    // All done. As an example, convert AST to plain JSON tree
    ASTTree.traverse(function(node) {
        delete node.parent; // JSON.stingify below can't handle circles
    });

    $('#output').empty().text(JSON.stringify(ASTTree, undefined, 4));
    printErrors(errors);
}

function printErrors(errors) {
    var errorText = '';

    errors.forEach(function(error, index) {
        errorText += 'ERROR #' + index + ': ' + error + '\n';
    });

    $('#errors').empty().prepend(errorText + '\n');
}

function getInput() {
    return $('#input').val();
}
