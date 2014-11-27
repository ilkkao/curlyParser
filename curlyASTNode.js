
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
