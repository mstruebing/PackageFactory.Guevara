import {$get} from 'plow-js';
import Immutable from 'immutable';
import {createSelector, defaultMemoize} from 'reselect';

import {getCurrentContentCanvasContextPath} from './../../UI/ContentCanvas/selectors';

const nodes = $get(['cr', 'nodes', 'byContextPath']);
const siteNode = $get('cr.nodes.siteNode');
const focused = $get('cr.nodes.focused.contextPath');

const parentNodeContextPath = contextPath => {
    if (typeof contextPath !== 'string') {
        return null;
    }

    const [path, context] = contextPath.split('@');

    return `${path.substr(0, path.lastIndexOf('/'))}@${context}`;
};

export const isDocumentNodeSelectedSelector = createSelector(
    [
        focused,
        getCurrentContentCanvasContextPath
    ],
    (focused, currentContentCanvasContextPath) => {
        return !focused || (focused === currentContentCanvasContextPath);
    }
);

export const hasFocusedContentNode = createSelector(
    [
        focused,
        getCurrentContentCanvasContextPath
    ],
    (focused, currentContentCanvasContextPath) => {
        return Boolean(focused && (focused !== currentContentCanvasContextPath));
    }
);

export const nodeByContextPath = state => contextPath =>
    $get(['cr', 'nodes', 'byContextPath', contextPath], state);

export const makeGetDocumentNodes = nodeTypesRegistry => createSelector(
    [
        nodes
    ],
    nodesMap => {
        const documentSubNodeTypes = nodeTypesRegistry.getSubTypesOf(nodeTypesRegistry.getRole('document'));

        return nodesMap.filter(node => documentSubNodeTypes.includes(node.get('nodeType')));
    }
);

export const makeGetNodeByContextPathSelector = contextPath => createSelector(
    [
        state => $get(['cr', 'nodes', 'byContextPath', contextPath], state)
    ],
    node => node
);

export const makeHasChildrenSelector = allowedNodeTypes => createSelector(
    [
        (state, contextPath) => $get(['cr', 'nodes', 'byContextPath', contextPath, 'children'], state)
    ],
    childNodeEnvelopes => (childNodeEnvelopes || []).some(
        childNodeEnvelope => allowedNodeTypes.includes($get('nodeType', childNodeEnvelope))
    )
);

export const makeChildrenOfSelector = allowedNodeTypes => createSelector(
    [
        (state, contextPath) => $get(['cr', 'nodes', 'byContextPath', contextPath, 'children'], state),
        $get('cr.nodes.byContextPath')
    ],
    (childNodeEnvelopes, nodesByContextPath) => (childNodeEnvelopes || [])
    .filter(
        childNodeEnvelope => allowedNodeTypes.includes($get('nodeType', childNodeEnvelope))
    )
    .map(
        $get('contextPath')
    )
    .map(
        contextPath => $get(contextPath, nodesByContextPath)
    )
    .filter(node => node)
);

export const siteNodeSelector = createSelector(
    [
        siteNode,
        $get('cr.nodes.byContextPath')
    ],
    (siteNodeContextPath, nodesByContextPath) => $get(siteNodeContextPath, nodesByContextPath)
);

export const currentContentCanvasNodeSelector = createSelector(
    [
        getCurrentContentCanvasContextPath,
        $get('cr.nodes.byContextPath')
    ],
    (currentContentCanvasNode, nodesByContextPath) => $get(currentContentCanvasNode, nodesByContextPath)
);

export const byContextPathSelector = defaultMemoize(
    contextPath => createSelector(
        [
            nodeByContextPath
        ],
        getNodeByContextPath => getNodeByContextPath(contextPath)
    )
);

export const parentNodeSelector = state => baseNode =>
    byContextPathSelector(parentNodeContextPath($get('contextPath', baseNode)))(state);

export const grandParentNodeSelector = state => baseNode =>
    byContextPathSelector(parentNodeContextPath(parentNodeContextPath($get('contextPath', baseNode))))(state);

export const focusedNodePathSelector = createSelector(
    [
        focused,
        getCurrentContentCanvasContextPath
    ],
    (focused, currentContentCanvasContextPath) => {
        return focused || currentContentCanvasContextPath;
    }
);

export const focusedSelector = createSelector(
    [
        focusedNodePathSelector,
        nodeByContextPath
    ],
    (focusedNodePath, getNodeByContextPath) =>
        getNodeByContextPath(focusedNodePath)
);

export const focusedNodeTypeSelector = createSelector(
    [
        focusedSelector
    ],
    focused =>
        $get('nodeType', focused)
);

export const focusedNodeIdentifierSelector = createSelector(
    [
        focusedSelector
    ],
    focused =>
        $get('identifier', focused)
);

export const focusedParentSelector = createSelector(
    [
        focusedSelector,
        state => state
    ],
    (focusedNode, state) => {
        if (!focusedNode) {
            return undefined;
        }

        return parentNodeSelector(state)(focusedNode);
    }
);

export const focusedGrandParentSelector = createSelector(
    [
        focusedParentSelector,
        state => state
    ],
    (focusedParentNode, state) => {
        if (!focusedParentNode) {
            return undefined;
        }

        return parentNodeSelector(state)(focusedParentNode);
    }
);

export const clipboardNodeContextPathSelector = createSelector(
    [
        $get('cr.nodes.clipboard')
    ],
    clipboardNodeContextPath => clipboardNodeContextPath
);

export const clipboardIsEmptySelector = createSelector(
    [
        $get('cr.nodes.clipboard')
    ],
    clipboardNodePath => Boolean(clipboardNodePath)
);

export const getPathInNode = (state, contextPath, propertyPath) => {
    const node = $get(['cr', 'nodes', 'byContextPath', contextPath], state);

    return $get(propertyPath, node);
};

export const makeGetAllowedChildNodeTypesSelector = (nodeTypesRegistry, elevator = id => id) => createSelector(
    [
        (state, {reference}) => getPathInNode(state, elevator(reference), 'policy.canEdit'),
        (state, {reference}) => getPathInNode(state, elevator(reference), 'policy.disallowedNodeTypes'),
        (state, {reference}) => getPathInNode(state, elevator(reference), 'isAutoCreated'),
        (state, {reference}) => getPathInNode(state, elevator(reference), 'name'),
        (state, {reference}) => getPathInNode(state, elevator(reference), 'nodeType'),
        (state, {reference}) => getPathInNode(state, elevator(parentNodeContextPath(reference)), 'nodeType'),
        (state, {role}) => role
    ],
    (canEdit, disallowedNodeTypes, ...args) => canEdit ?
        nodeTypesRegistry
            .getAllowedNodeTypesTakingAutoCreatedIntoAccount(...args)
            .filter(nodeType => !disallowedNodeTypes.includes(nodeType)) :
        []
);

export const makeGetAllowedSiblingNodeTypesSelector = nodeTypesRegistry =>
    makeGetAllowedChildNodeTypesSelector(nodeTypesRegistry, parentNodeContextPath);

export const makeIsAllowedToAddChildOrSiblingNodes = nodeTypesRegistry => createSelector(
    [
        makeGetAllowedChildNodeTypesSelector(nodeTypesRegistry),
        makeGetAllowedSiblingNodeTypesSelector(nodeTypesRegistry)
    ],
    (allowedChildNodeTypes, allowedSiblingNodeTypes) =>
        Boolean(allowedChildNodeTypes.length + allowedSiblingNodeTypes.length)
);

export const makeCanBeCopiedAlongsideSelector = nodeTypesRegistry => createSelector(
    [
        (state, {subject}) => getPathInNode(state, subject, 'nodeType'),
        makeGetAllowedSiblingNodeTypesSelector(nodeTypesRegistry)
    ],
    (subjectNodeType, allowedNodeTypes) => allowedNodeTypes.includes(subjectNodeType)
);

export const makeCanBeCopiedIntoSelector = nodeTypesRegistry => createSelector(
    [
        (state, {subject}) => getPathInNode(state, subject, 'nodeType'),
        makeGetAllowedChildNodeTypesSelector(nodeTypesRegistry)
    ],
    (subjectNodeType, allowedNodeTypes) => allowedNodeTypes.includes(subjectNodeType)
);

export const makeCanBeMovedIntoSelector = nodeTypesRegistry => createSelector(
    [
        makeCanBeCopiedIntoSelector(nodeTypesRegistry),
        (state, {subject, reference}) => {
            const subjectPath = subject && subject.split('@')[0];
            return subjectPath ? reference.indexOf(subjectPath) === 0 : false;
        }
    ],
    (canBeInsertedInto, referenceIsDescendantOfSubject) => canBeInsertedInto && !referenceIsDescendantOfSubject
);

export const makeCanBeMovedAlongsideSelector = nodeTypesRegistry => createSelector(
    [
        makeCanBeCopiedAlongsideSelector(nodeTypesRegistry),
        (state, {subject, reference}) => {
            const subjectPath = subject && subject.split('@')[0];
            return subjectPath ? parentNodeContextPath(reference).indexOf(subjectPath) === 0 : false;
        }
    ],
    (canBeInsertedInto, referenceIsDescendantOfSubject) => canBeInsertedInto && !referenceIsDescendantOfSubject
);

export const makeCanBeCopiedSelector = nodeTypesRegistry => createSelector(
    [
        makeCanBeCopiedAlongsideSelector(nodeTypesRegistry),
        makeCanBeCopiedIntoSelector(nodeTypesRegistry)
    ],
    (canBeInsertedAlongside, canBeInsertedInto) => (canBeInsertedAlongside || canBeInsertedInto)
);

export const makeCanBeMovedSelector = nodeTypesRegistry => createSelector(
    [
        makeCanBeMovedAlongsideSelector(nodeTypesRegistry),
        makeCanBeMovedIntoSelector(nodeTypesRegistry)
    ],
    (canBeMovedAlongside, canBeMovedInto) => (canBeMovedAlongside || canBeMovedInto)
);

export const makeCanBePastedSelector = nodeTypesRegistry => createSelector(
    [
        makeCanBeMovedSelector(nodeTypesRegistry),
        makeCanBeCopiedSelector(nodeTypesRegistry),
        $get('cr.nodes.clipboardMode')
    ],
    (canBeMoved, canBeCopied, mode) => mode === 'Copy' ? canBeCopied : canBeMoved
);

export const destructiveOperationsAreDisabledSelector = createSelector(
    [
        siteNode,
        focused,
        focusedSelector
    ],
    (siteNodeContextPath, focusedNodeContextPath, focusedNode) => {
        return (
            Boolean(focusedNode) === false ||
            $get('isAutoCreated', focusedNode) ||
            siteNodeContextPath === focusedNodeContextPath
        );
    }
);

export const focusedNodeParentLineSelector = createSelector(
    [
        focusedSelector,
        $get('cr.nodes.byContextPath'),
        (_, highestConsideredParentNode) => highestConsideredParentNode
    ],
    (focusedNode, nodesByContextPath, highestConsideredParentNode) => {
        let result = Immutable.fromJS([focusedNode]);
        let currentNode = focusedNode;

        while (currentNode && $get('contextPath', currentNode) !== $get('contextPath', highestConsideredParentNode)) {
            currentNode = $get(parentNodeContextPath($get('contextPath', currentNode)), nodesByContextPath);
            if (currentNode) {
                result = result.push(currentNode);
            }
        }

        return result;
    }
);

export const makeHasForeignChangesSelector = () => createSelector(
    [
        $get('cr.nodes.byContextPath'),
        (state, contextPath) => {
            return contextPath;
        }
    ],
    (nodes, contextPath) => nodes && nodes.filter(i => $get('hasForeignChanges', i) && $get('contextPath', i) === contextPath).count() > 0
);

export const makeForeignWorkspacesWithChangesSelector = () => createSelector(
    [
        $get('cr.nodes.byContextPath'),
        (state, contextPath) => {
            return contextPath;
        }
    ],
    (nodes, contextPath) => {
        if (nodes) {
            return nodes.reduce((workspaces, node) => {
                if (nodes.filter(i => $get('hasForeignChanges', i) && $get('contextPath', i) === contextPath).count() > 0) {
                    if ($get('hasForeignChanges', node)) {
                        workspaces.push($get('foreignWorkspacesWithChanges', node)._tail.array);
                    }
                }

                return workspaces;
            }, []);
        }

        return [];
    }
);
