
function CurlyScanner() {
    var that = this;

    // List of states. Rules are enabled and disabled based on the state.
    //
    // HTML_CONTEXT               (not inside a curly tag)
    // CURLY_CONTEXT              (inside a curly tag)
    // CURLY_NAME_CONTEXT         (expecting curly component name)
    // CURLY_ATTR_VALUE_CONTEXT   (expecting component attribute value)

    this.lexer = new Lexer(function(char) {
        that.state = 'HTML_CONTEXT';
        throw('*** SYNTAX ERROR near: \'' + char + '\'');
    })
    .addRule(/[\S\s]*?(?=\{\{|$)/, function(lexeme) { // Anything up to '{{' or EOF, don't consume the '{{' part
        if (that.state !== 'HTML_CONTEXT') {
            this.reject = true;
        } else {
            that.state = 'CURLY_CONTEXT';
            return { name: 'HTML_STRING', value: lexeme };
        }
    })
    .addRule(/\w+=/, function(lexeme) { // One or more alphanumerics followed by '='
        if (that.state !== 'CURLY_CONTEXT') {
            this.reject = true;
        } else {
            that.state = 'CURLY_ATTR_VALUE_CONTEXT';
            return { name: 'CURLY_ATTR_NAME', value: lexeme.slice(0, -1) };
        }
    })
    .addRule(/\".*?\"/, function(lexeme) { // '"' followed by anything up to next '"' TBD: doesn't support \"
        if (that.state !== 'CURLY_ATTR_VALUE_CONTEXT') {
            this.reject = true;
        } else {
            that.state = 'CURLY_CONTEXT';
            return { name: 'CURLY_ATTR_VALUE', value: lexeme.slice(1, -1) };
        }
    })
    .addRule(/[^"\s]\S*?(?=}}|\s)/, function(lexeme) { // Not '"' followed by anything up to '}}' or whitespace character, don't consume '}}' part
        if (that.state !== 'CURLY_ATTR_VALUE_CONTEXT') {
            this.reject = true;
        } else {
            that.state = 'CURLY_CONTEXT';
            return { name: 'CURLY_ATTR_VALUE', value: lexeme };
        }
    })
    .addRule(/\s+/, function() { // One or more whitespace characters
        if (that.state !== 'CURLY_CONTEXT') {
            this.reject = true;
        }
    })
    .addRule(/\{\{/, function () { // '{{'
        that.state = 'CURLY_NAME_CONTEXT';
        return [ { name: 'CURLY_TAG_START' } ];
    })
    .addRule(/\{\{#/, function() { // '{{#'
        that.state = 'CURLY_NAME_CONTEXT';
        return [ { name: 'CURLY_TAG_START' }, { name: 'CURLY_CONDITIONAL' } ];
    })
    .addRule(/\{\{!.*?(?=\}\})/, function(lexeme) { // '{{!'' followed by any characters up to next '}}'
        that.state = 'CURLY_CONTEXT';
        return [ { name: 'CURLY_TAG_START' }, { name: 'CURLY_COMMENT', value: lexeme.substring(3) } ];
    })
    .addRule(/\{\{@/, function() { // '{{@'
        that.state = 'CURLY_NAME_CONTEXT';
        return [ { name: 'CURLY_TAG_START' }, { name: 'CURLY_CONTEXT_BLOCK_START' } ];
    })
    .addRule(/\{\{\*/, function() { // '{{*'
        that.state = 'CURLY_NAME_CONTEXT';
        return [ { name: 'CURLY_TAG_START' }, { name: 'CURLY_COLLECTION_BLOCK_START' } ];
    })
    .addRule(/\{\{\//, function() { // '{{/'
        that.state = 'CURLY_NAME_CONTEXT';
        return [ { name: 'CURLY_TAG_START' }, { name: 'CURLY_BLOCK_END' } ];
    })
    .addRule(/\{\{\{/, function() { // '{{{'
        that.state = 'HTML_CONTEXT';
        return [ { name: 'CURLY_ESCAPE_CURLY' } ];
    })
    .addRule(/[\w.?]+/, function(lexeme) { // One or more alphanumerics or dots
        if (that.state !== 'CURLY_NAME_CONTEXT') {
            this.reject = true;
        } else {
            that.state = 'CURLY_CONTEXT';
            return { name: 'CURLY_NAME', value: lexeme };
        }
    })
    .addRule(/\}\}/, function() { // '}}'
        if (that.state === 'HTML_CONTEXT') {
            this.reject = true;
        } else {
            that.state = 'HTML_CONTEXT';
            return { name: 'CURLY_TAG_END' };
        }
    });
}

CurlyScanner.prototype.setInput = function(input) {
    this.state = 'HTML_CONTEXT';
    return this.lexer.setInput(input);
}

CurlyScanner.prototype.scan = function() {
    return this.lexer.lex();
}
