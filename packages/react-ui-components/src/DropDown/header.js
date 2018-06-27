import React from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'classnames';
import {makeFocusNode} from './../_lib/focusNode';

const emptyFn = () => null;

const ShallowDropDownHeader = props => {
    const {
        className,
        children,
        theme,
        isOpen,
        showDropDownToggle,
        toggleDropDown,
        IconComponent,
        _refHandler,
        shouldKeepFocusState,
        iconIsOpen,
        iconIsClosed,
        iconRest,
        disabled,
        ...rest
    } = props;
    const iconName = isOpen ? iconIsOpen : iconIsClosed;
    const finalClassName = mergeClassNames({
        [theme.dropDown__btn]: true,
        [className]: className && className.length,
        [theme['dropDown__btn--withChevron']]: showDropDownToggle
    });

    return (
        <div
            {...rest}
            role="button"
            onClick={disabled ? null : toggleDropDown}
            ref={shouldKeepFocusState ? _refHandler(isOpen) : emptyFn}
            className={finalClassName}
            aria-haspopup="true"
            >
            {children}
            {showDropDownToggle && <IconComponent icon={iconName} className={theme.dropDown__chevron} {...iconRest} />}
        </div>
    );
};
ShallowDropDownHeader.propTypes = {
    /**
     * An optional `className` to attach to the wrapper.
     */
    className: PropTypes.string,

    /**
     * The contents to be rendered within the header.
     */
    children: PropTypes.node,

    /**
     * An optional css theme to be injected.
     */
    theme: PropTypes.shape({/* eslint-disable quote-props */
        'dropDown__btn': PropTypes.string,
        'dropDown__btnLabel': PropTypes.string,
        'dropDown__chevron': PropTypes.string
    }).isRequired, /* eslint-enable quote-props */

    /**
     * Static component dependencies which are injected from the outside (index.js)
     */
    IconComponent: PropTypes.any.isRequired,

    /**
     * Icon to use if the dropdown is opened
     */
    iconIsOpen: PropTypes.string,

    /**
     * Icon to use if the dropdown is opened
     */
    iconIsClosed: PropTypes.string,

    /**
     * A object wich will be spreaded on the icon component
     */
    iconRest: PropTypes.object,

    /**
     * These props control the visual state of the contents, and are passed
     * from the outside via the `ContextDropDownHeader` component.
     */
    isOpen: PropTypes.bool,
    toggleDropDown: PropTypes.func.isRequired,

    showDropDownToggle: PropTypes.bool,

    /**
     * An interal prop for testing purposes, do not set this prop manually.
     */
    _refHandler: PropTypes.func,

    /**
     * If TRUE, will keep the focussed state of the element when re-drawing.
     * Must be set to FALSE when connected components want to manage the focus state themselves (e.g.
     * when this component is used to build a select box)
     */
    shouldKeepFocusState: PropTypes.bool,

    /**
     * Disable the onclick handler if disabled
     */
    disabled: PropTypes.bool
};
ShallowDropDownHeader.defaultProps = {
    _refHandler: makeFocusNode,
    showDropDownToggle: true,
    shouldKeepFocusState: true,
    iconIsOpen: 'chevron-up',
    iconIsClosed: 'chevron-down'
};

export default ShallowDropDownHeader;
