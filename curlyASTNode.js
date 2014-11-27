
function curlyASTNode(type, data) {
    this.type = type;
    this.data = data;

    this.parent = null;
    this.children = [];
}

curlyASTNode.prototype.addChild = function(child) {
    this.children.push(child);
};

curlyASTNode.prototype.setParent = function(parent) {
    this.parent = parent;
};

curlyASTNode.prototype.traverse = function(callback) {
    callback(this);

    for (var i = 0; i < this.children.length; i++) {
        this.children[i].traverse(callback);
    }
};
