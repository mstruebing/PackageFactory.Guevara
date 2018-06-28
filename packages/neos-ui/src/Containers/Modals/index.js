import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {neos} from '@neos-project/neos-ui-decorators';

@neos(globalRegistry => ({
    containerRegistry: globalRegistry.get('containers')
}))
export default class Modals extends PureComponent {
    static propTypes = {
        containerRegistry: PropTypes.object.isRequired
    };

    render() {
        const {containerRegistry} = this.props;

        const DiscardDialog = containerRegistry.get('Modals/DiscardDialog');
        const DeleteNodeModal = containerRegistry.get('Modals/DeleteNodeModal');
        const InsertModeModal = containerRegistry.get('Modals/InsertModeModal');
        const KeyboardShortcutModal = containerRegistry.get('Modals/KeyboardShortcutModal');
        const SelectNodeTypeModal = containerRegistry.get('Modals/SelectNodeTypeModal');
        const NodeCreationDialog = containerRegistry.get('Modals/NodeCreationDialog');
        const NodeVariantCreationDialog = containerRegistry.get('Modals/NodeVariantCreationDialog');
        const ReloginDialog = containerRegistry.get('Modals/ReloginDialog');
        const UnappliedChangesDialog = containerRegistry.get('Modals/UnappliedChangesDialog');

        return (
            <div>
                <DiscardDialog/>
                <DeleteNodeModal/>
                <InsertModeModal/>
                <KeyboardShortcutModal />
                <SelectNodeTypeModal/>
                <NodeCreationDialog/>
                <NodeVariantCreationDialog/>
                <ReloginDialog/>
                <UnappliedChangesDialog/>
            </div>
        );
    }
}
