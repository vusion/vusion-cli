'use strict';

const postcss = require('postcss');
const { EXTEND_START, EXTEND_END, IMPORT_START, IMPORT_END } = require('./DIVIDERS');

function merge(extendNodes, normalNodes) {
    const newNormalNodes = [];
    normalNodes.forEach((node) => {
        if (node.type !== 'rule')
            return newNormalNodes.push(node);

        const extendNode = extendNodes.find((extendNode) => extendNode.selector === node.selector);
        if (extendNode)
            extendNode.nodes.push(...node.nodes);
        else
            newNormalNodes.push(node);
    });
    return newNormalNodes;
}

/**
 * @param {Array<Block>} blocks
 * @return {Array<Node>} nodes
 */
function flattenBlocks(blocks) {
    if (!blocks.length)
        return [];
    if (blocks.length === 1 && Array.isArray(blocks[0]))
        return blocks[0];

    const nodes = [];
    let i = 0;
    while (i < blocks.length) {
        const block = blocks[i];
        if (Array.isArray(block))
            nodes.push(...block);
        else {
            if (block.type === 'import')
                nodes.push(...flattenBlocks(block.blocks));
            else if (block.type === 'extend') {
                const extendNodes = flattenBlocks(block.blocks);
                const normalNodes = blocks[++i];
                if (!normalNodes || !Array.isArray(normalNodes))
                    nodes.push(...extendNodes);
                else
                    nodes.push(...merge(extendNodes, normalNodes));
            } else
                throw new TypeError('Wrong block type!');
        }
        i++;
    }
    return nodes;
}

module.exports = postcss.plugin('postcss-vusion-extend-merge', () => (styles, result) => {
    /**
     * Combine in blocks
     *  const compositeBlock = {
     *      type: 'composite',
     *      blocks: [],
     * }
     * const nodes = []
     */
    console.log(styles.toString());

    const blockStack = [];
    blockStack.push({
        type: 'root',
        blocks: [],
    });
    let nodes = [];
    styles.nodes.forEach((node) => {
        if (node.type !== 'comment')
            nodes.push(node);
        else {
            if (node.text === EXTEND_START || node.text === IMPORT_START) {
                const lastBlock = blockStack[blockStack.length - 1];
                if (nodes.length) {
                    lastBlock.blocks.push(nodes);
                    nodes = [];
                }
                blockStack.push({
                    type: node.text === EXTEND_START ? 'extend' : 'import',
                    blocks: [],
                });
            } else if (node.text === EXTEND_END || node.text === IMPORT_END) {
                const lastBlock = blockStack.pop();
                if (nodes.length) {
                    lastBlock.blocks.push(nodes);
                    nodes = [];
                }
                const parentBlock = blockStack[blockStack.length - 1];
                parentBlock.blocks.push(lastBlock);
            }
        }
    });

    const rootBlock = blockStack.pop();
    if (nodes.length) {
        rootBlock.blocks.push(nodes);
        nodes = [];
    }

    const finalNodes = flattenBlocks(rootBlock.blocks);
    styles.nodes = finalNodes;
});
