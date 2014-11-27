
// Node Types:
//
// Leaf nodes:
//   'HTML'
//   'ESCAPE'
//   'IDENTIFIER'
//   'COMMENT'
//
// Nodes with children
//   'ROOT' (abstract)
//   'CONDITIONAL'
//   'COLLECTION'
//   'CONTEXT'

function CurlyParser() {
    this.currentToken = '';
}

CurlyParser.prototype.parse = function(tokens) {
    this.tokens = tokens;
    this.cursor = null;

    var treeRoot = this.addChildNodeAndTraverseDown('ROOT', null);

    while (this.currentToken = this.getNextToken()) {
        switch(this.currentToken.name) {
            case 'HTML_STRING':
                this.addChildNode('HTML', this.currentToken.value);
                break;

            case 'CURLY_ESCAPE_CURLY':
                this.addChildNode('ESCAPE');
                break;

            case 'CURLY_TAG_START':
                this.parseTag();
                break;
        }
    }

    return treeRoot;
};

CurlyParser.prototype.parseTag = function() {
    this.currentToken = this.getNextToken();

    switch(this.currentToken.name) {
        case 'CURLY_NAME':
            this.parseIdentifierTag();
            break;

        case 'CURLY_CONDITIONAL':
            this.parseConditionalTag();
            break;

        case 'CURLY_COMMENT':
            this.parseCommentTag();
            break;

        case 'CURLY_COLLECTION_BLOCK_START':
            this.parseCollectionBlockStartTag();
            break;

        case 'CURLY_CONTEXT_BLOCK_START':
            this.parseContextBlockStartTag();
            break;

        case 'CURLY_BLOCK_END':
            this.parseBlockEndTag();
            break;
    }
};

CurlyParser.prototype.parseIdentifierTag = function() {
    var name = this.currentToken.value;
    var parameters = [];

    while (this.currentToken = this.getNextToken()) {
        switch(this.currentToken.name) {
            case 'CURLY_ATTR_NAME':
                var paramName = this.currentToken.value;
                var paramValue = this.getNextToken();

                parameters.push({
                    name: paramName,
                    value: paramValue
                });
                break;

            case 'CURLY_TAG_END':
                this.addChildNode('IDENTIFIER', { name: name, parameters: parameters });
                return;
        }
    }
};

CurlyParser.prototype.parseCommentTag = function() {
    var comment = this.currentToken.value;
    var tagEnd = this.getNextToken();

    this.addChildNode('COMMENT', { comment: comment });
};

CurlyParser.prototype.parseConditionalTag = function() {
    var name = this.getNextToken().value;
    var tagEnd = this.getNextToken();

    this.addChildNodeAndTraverseDown('CONDITIONAL', { name: name });
};

CurlyParser.prototype.parseCollectionBlockStartTag = function() {
    var name = this.getNextToken().value;
    var tagEnd = this.getNextToken();

    this.addChildNodeAndTraverseDown('COLLECTION', { name: name });
};

CurlyParser.prototype.parseContextBlockStartTag = function() {
    var name = this.getNextToken().value;
    var tagEnd = this.getNextToken();

    this.addChildNodeAndTraverseDown('CONTEXT', { name: name });
};

CurlyParser.prototype.parseBlockEndTag = function() {
    var name = this.getNextToken().value;
    var tagEnd = this.getNextToken();

    this.traverseUp();
};

CurlyParser.prototype.getNextToken = function() {
    return this.tokens.shift();
};

CurlyParser.prototype.addChildNode = function(type, data) {
    var node = new curlyASTNode(type, data);

    if (this.cursor) {
        var parent = this.cursor;
        node.setParent(parent);
        parent.addChild(node);
    }

    return node;
};

CurlyParser.prototype.addChildNodeAndTraverseDown = function(type, data) {
    var node = this.addChildNode(type, data);
    this.cursor = node;
    return node;
};

CurlyParser.prototype.traverseUp = function() {
    this.cursor = this.cursor.parent; // TBD: Assert if no parent
};
