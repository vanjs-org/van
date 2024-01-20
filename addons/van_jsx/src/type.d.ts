import CSS from "csstype";
import { State } from "vanjs-core";
import { VanNode } from "./createElement";
export type Primitive = string | number | boolean | bigint;
export type Key = number | string | symbol;
export type PrimitiveChild = Primitive;
interface EventHandler<E extends Event = Event> {
    (event: E): void;
}
export interface DOMAttributes {
    onCopy?: EventHandler<ClipboardEvent> | undefined;
    onCopyCapture?: EventHandler<ClipboardEvent> | undefined;
    onCut?: EventHandler<ClipboardEvent> | undefined;
    onCutCapture?: EventHandler<ClipboardEvent> | undefined;
    onPaste?: EventHandler<ClipboardEvent> | undefined;
    onPasteCapture?: EventHandler<ClipboardEvent> | undefined;
    onCompositionEnd?: EventHandler<CompositionEvent> | undefined;
    onCompositionEndCapture?: EventHandler<CompositionEvent> | undefined;
    onCompositionStart?: EventHandler<CompositionEvent> | undefined;
    onCompositionStartCapture?: EventHandler<CompositionEvent> | undefined;
    onCompositionUpdate?: EventHandler<CompositionEvent> | undefined;
    onCompositionUpdateCapture?: EventHandler<CompositionEvent> | undefined;
    onFocus?: EventHandler<FocusEvent> | undefined;
    onFocusCapture?: EventHandler<FocusEvent> | undefined;
    onBlur?: EventHandler<FocusEvent> | undefined;
    onBlurCapture?: EventHandler<FocusEvent> | undefined;
    onChange?: EventHandler<Event> | undefined;
    onChangeCapture?: EventHandler<Event> | undefined;
    onBeforeInput?: EventHandler<Event> | undefined;
    onBeforeInputCapture?: EventHandler<Event> | undefined;
    onInput?: EventHandler<Event> | undefined;
    onInputCapture?: EventHandler<Event> | undefined;
    onReset?: EventHandler<Event> | undefined;
    onResetCapture?: EventHandler<Event> | undefined;
    onSubmit?: EventHandler<Event> | undefined;
    onSubmitCapture?: EventHandler<Event> | undefined;
    onInvalid?: EventHandler<Event> | undefined;
    onInvalidCapture?: EventHandler<Event> | undefined;
    onLoad?: EventHandler | undefined;
    onLoadCapture?: EventHandler | undefined;
    onError?: EventHandler | undefined;
    onErrorCapture?: EventHandler | undefined;
    onKeyDown?: EventHandler<KeyboardEvent> | undefined;
    onKeyDownCapture?: EventHandler<KeyboardEvent> | undefined;
    /** @deprecated */
    onKeyPress?: EventHandler<KeyboardEvent> | undefined;
    /** @deprecated */
    onKeyPressCapture?: EventHandler<KeyboardEvent> | undefined;
    onKeyUp?: EventHandler<KeyboardEvent> | undefined;
    onKeyUpCapture?: EventHandler<KeyboardEvent> | undefined;
    onAbort?: EventHandler | undefined;
    onAbortCapture?: EventHandler | undefined;
    onCanPlay?: EventHandler | undefined;
    onCanPlayCapture?: EventHandler | undefined;
    onCanPlayThrough?: EventHandler | undefined;
    onCanPlayThroughCapture?: EventHandler | undefined;
    onDurationChange?: EventHandler | undefined;
    onDurationChangeCapture?: EventHandler | undefined;
    onEmptied?: EventHandler | undefined;
    onEmptiedCapture?: EventHandler | undefined;
    onEncrypted?: EventHandler | undefined;
    onEncryptedCapture?: EventHandler | undefined;
    onEnded?: EventHandler | undefined;
    onEndedCapture?: EventHandler | undefined;
    onLoadedData?: EventHandler | undefined;
    onLoadedDataCapture?: EventHandler | undefined;
    onLoadedMetadata?: EventHandler | undefined;
    onLoadedMetadataCapture?: EventHandler | undefined;
    onLoadStart?: EventHandler | undefined;
    onLoadStartCapture?: EventHandler | undefined;
    onPause?: EventHandler | undefined;
    onPauseCapture?: EventHandler | undefined;
    onPlay?: EventHandler | undefined;
    onPlayCapture?: EventHandler | undefined;
    onPlaying?: EventHandler | undefined;
    onPlayingCapture?: EventHandler | undefined;
    onProgress?: EventHandler | undefined;
    onProgressCapture?: EventHandler | undefined;
    onRateChange?: EventHandler | undefined;
    onRateChangeCapture?: EventHandler | undefined;
    onSeeked?: EventHandler | undefined;
    onSeekedCapture?: EventHandler | undefined;
    onSeeking?: EventHandler | undefined;
    onSeekingCapture?: EventHandler | undefined;
    onStalled?: EventHandler | undefined;
    onStalledCapture?: EventHandler | undefined;
    onSuspend?: EventHandler | undefined;
    onSuspendCapture?: EventHandler | undefined;
    onTimeUpdate?: EventHandler | undefined;
    onTimeUpdateCapture?: EventHandler | undefined;
    onVolumeChange?: EventHandler | undefined;
    onVolumeChangeCapture?: EventHandler | undefined;
    onWaiting?: EventHandler | undefined;
    onWaitingCapture?: EventHandler | undefined;
    onAuxClick?: EventHandler<MouseEvent> | undefined;
    onAuxClickCapture?: EventHandler<MouseEvent> | undefined;
    onClick?: EventHandler<MouseEvent> | undefined;
    onClickCapture?: EventHandler<MouseEvent> | undefined;
    onContextMenu?: EventHandler<MouseEvent> | undefined;
    onContextMenuCapture?: EventHandler<MouseEvent> | undefined;
    onDoubleClick?: EventHandler<MouseEvent> | undefined;
    onDoubleClickCapture?: EventHandler<MouseEvent> | undefined;
    onDrag?: EventHandler<DragEvent> | undefined;
    onDragCapture?: EventHandler<DragEvent> | undefined;
    onDragEnd?: EventHandler<DragEvent> | undefined;
    onDragEndCapture?: EventHandler<DragEvent> | undefined;
    onDragEnter?: EventHandler<DragEvent> | undefined;
    onDragEnterCapture?: EventHandler<DragEvent> | undefined;
    onDragExit?: EventHandler<DragEvent> | undefined;
    onDragExitCapture?: EventHandler<DragEvent> | undefined;
    onDragLeave?: EventHandler<DragEvent> | undefined;
    onDragLeaveCapture?: EventHandler<DragEvent> | undefined;
    onDragOver?: EventHandler<DragEvent> | undefined;
    onDragOverCapture?: EventHandler<DragEvent> | undefined;
    onDragStart?: EventHandler<DragEvent> | undefined;
    onDragStartCapture?: EventHandler<DragEvent> | undefined;
    onDrop?: EventHandler<DragEvent> | undefined;
    onDropCapture?: EventHandler<DragEvent> | undefined;
    onMouseDown?: EventHandler<MouseEvent> | undefined;
    onMouseDownCapture?: EventHandler<MouseEvent> | undefined;
    onMouseEnter?: EventHandler<MouseEvent> | undefined;
    onMouseLeave?: EventHandler<MouseEvent> | undefined;
    onMouseMove?: EventHandler<MouseEvent> | undefined;
    onMouseMoveCapture?: EventHandler<MouseEvent> | undefined;
    onMouseOut?: EventHandler<MouseEvent> | undefined;
    onMouseOutCapture?: EventHandler<MouseEvent> | undefined;
    onMouseOver?: EventHandler<MouseEvent> | undefined;
    onMouseOverCapture?: EventHandler<MouseEvent> | undefined;
    onMouseUp?: EventHandler<MouseEvent> | undefined;
    onMouseUpCapture?: EventHandler<MouseEvent> | undefined;
    onSelect?: EventHandler | undefined;
    onSelectCapture?: EventHandler | undefined;
    onTouchCancel?: EventHandler<TouchEvent> | undefined;
    onTouchCancelCapture?: EventHandler<TouchEvent> | undefined;
    onTouchEnd?: EventHandler<TouchEvent> | undefined;
    onTouchEndCapture?: EventHandler<TouchEvent> | undefined;
    onTouchMove?: EventHandler<TouchEvent> | undefined;
    onTouchMoveCapture?: EventHandler<TouchEvent> | undefined;
    onTouchStart?: EventHandler<TouchEvent> | undefined;
    onTouchStartCapture?: EventHandler<TouchEvent> | undefined;
    onPointerDown?: EventHandler<PointerEvent> | undefined;
    onPointerDownCapture?: EventHandler<PointerEvent> | undefined;
    onPointerMove?: EventHandler<PointerEvent> | undefined;
    onPointerMoveCapture?: EventHandler<PointerEvent> | undefined;
    onPointerUp?: EventHandler<PointerEvent> | undefined;
    onPointerUpCapture?: EventHandler<PointerEvent> | undefined;
    onPointerCancel?: EventHandler<PointerEvent> | undefined;
    onPointerCancelCapture?: EventHandler<PointerEvent> | undefined;
    onPointerEnter?: EventHandler<PointerEvent> | undefined;
    onPointerEnterCapture?: EventHandler<PointerEvent> | undefined;
    onPointerLeave?: EventHandler<PointerEvent> | undefined;
    onPointerLeaveCapture?: EventHandler<PointerEvent> | undefined;
    onPointerOver?: EventHandler<PointerEvent> | undefined;
    onPointerOverCapture?: EventHandler<PointerEvent> | undefined;
    onPointerOut?: EventHandler<PointerEvent> | undefined;
    onPointerOutCapture?: EventHandler<PointerEvent> | undefined;
    onGotPointerCapture?: EventHandler<PointerEvent> | undefined;
    onGotPointerCaptureCapture?: EventHandler<PointerEvent> | undefined;
    onLostPointerCapture?: EventHandler<PointerEvent> | undefined;
    onLostPointerCaptureCapture?: EventHandler<PointerEvent> | undefined;
    onScroll?: EventHandler<UIEvent> | undefined;
    onScrollCapture?: EventHandler<UIEvent> | undefined;
    onWheel?: EventHandler<WheelEvent> | undefined;
    onWheelCapture?: EventHandler<WheelEvent> | undefined;
    onAnimationStart?: EventHandler<AnimationEvent> | undefined;
    onAnimationStartCapture?: EventHandler<AnimationEvent> | undefined;
    onAnimationEnd?: EventHandler<AnimationEvent> | undefined;
    onAnimationEndCapture?: EventHandler<AnimationEvent> | undefined;
    onAnimationIteration?: EventHandler<AnimationEvent> | undefined;
    onAnimationIterationCapture?: EventHandler<AnimationEvent> | undefined;
    onTransitionEnd?: EventHandler<TransitionEvent> | undefined;
    onTransitionEndCapture?: EventHandler<TransitionEvent> | undefined;
}
type Booleanish = boolean | "true" | "false";
type CrossOrigin = "anonymous" | "use-credentials" | "" | undefined;
interface AriaAttributes {
    /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
    "aria-activedescendant"?: string | undefined;
    /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
    "aria-atomic"?: Booleanish | undefined;
    /**
     * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
     * presented if they are made.
     */
    "aria-autocomplete"?: "none" | "inline" | "list" | "both" | undefined;
    /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
    "aria-busy"?: Booleanish | undefined;
    /**
     * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
     * @see aria-pressed @see aria-selected.
     */
    "aria-checked"?: boolean | "false" | "mixed" | "true" | undefined;
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     * @see aria-colindex.
     */
    "aria-colcount"?: number | undefined;
    /**
     * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
     * @see aria-colcount @see aria-colspan.
     */
    "aria-colindex"?: number | undefined;
    /**
     * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-colindex @see aria-rowspan.
     */
    "aria-colspan"?: number | undefined;
    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     * @see aria-owns.
     */
    "aria-controls"?: string | undefined;
    /** Indicates the element that represents the current item within a container or set of related elements. */
    "aria-current"?: boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time" | undefined;
    /**
     * Identifies the element (or elements) that describes the object.
     * @see aria-labelledby
     */
    "aria-describedby"?: string | undefined;
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     * @see aria-describedby.
     */
    "aria-details"?: string | undefined;
    /**
     * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
     * @see aria-hidden @see aria-readonly.
     */
    "aria-disabled"?: Booleanish | undefined;
    /**
     * Indicates what functions can be performed when a dragged object is released on the drop target.
     * @deprecated in ARIA 1.1
     */
    "aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup" | undefined;
    /**
     * Identifies the element that provides an error message for the object.
     * @see aria-invalid @see aria-describedby.
     */
    "aria-errormessage"?: string | undefined;
    /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
    "aria-expanded"?: Booleanish | undefined;
    /**
     * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
     * allows assistive technology to override the general default of reading in document source order.
     */
    "aria-flowto"?: string | undefined;
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     * @deprecated in ARIA 1.1
     */
    "aria-grabbed"?: Booleanish | undefined;
    /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
    "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined;
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @see aria-disabled.
     */
    "aria-hidden"?: Booleanish | undefined;
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     * @see aria-errormessage.
     */
    "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling" | undefined;
    /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
    "aria-keyshortcuts"?: string | undefined;
    /**
     * Defines a string value that labels the current element.
     * @see aria-labelledby.
     */
    "aria-label"?: string | undefined;
    /**
     * Identifies the element (or elements) that labels the current element.
     * @see aria-describedby.
     */
    "aria-labelledby"?: string | undefined;
    /** Defines the hierarchical level of an element within a structure. */
    "aria-level"?: number | undefined;
    /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
    "aria-live"?: "off" | "assertive" | "polite" | undefined;
    /** Indicates whether an element is modal when displayed. */
    "aria-modal"?: Booleanish | undefined;
    /** Indicates whether a text box accepts multiple lines of input or only a single line. */
    "aria-multiline"?: Booleanish | undefined;
    /** Indicates that the user may select more than one item from the current selectable descendants. */
    "aria-multiselectable"?: Booleanish | undefined;
    /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
    "aria-orientation"?: "horizontal" | "vertical" | undefined;
    /**
     * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
     * @see aria-controls.
     */
    "aria-owns"?: string | undefined;
    /**
     * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
     * A hint could be a sample value or a brief description of the expected format.
     */
    "aria-placeholder"?: string | undefined;
    /**
     * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-setsize.
     */
    "aria-posinset"?: number | undefined;
    /**
     * Indicates the current "pressed" state of toggle buttons.
     * @see aria-checked @see aria-selected.
     */
    "aria-pressed"?: boolean | "false" | "mixed" | "true" | undefined;
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     * @see aria-disabled.
     */
    "aria-readonly"?: Booleanish | undefined;
    /**
     * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
     * @see aria-atomic.
     */
    "aria-relevant"?: "additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text" | "text additions" | "text removals" | undefined;
    /** Indicates that user input is required on the element before a form may be submitted. */
    "aria-required"?: Booleanish | undefined;
    /** Defines a human-readable, author-localized description for the role of an element. */
    "aria-roledescription"?: string | undefined;
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     * @see aria-rowindex.
     */
    "aria-rowcount"?: number | undefined;
    /**
     * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
     * @see aria-rowcount @see aria-rowspan.
     */
    "aria-rowindex"?: number | undefined;
    /**
     * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-rowindex @see aria-colspan.
     */
    "aria-rowspan"?: number | undefined;
    /**
     * Indicates the current "selected" state of various widgets.
     * @see aria-checked @see aria-pressed.
     */
    "aria-selected"?: Booleanish | undefined;
    /**
     * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-posinset.
     */
    "aria-setsize"?: number | undefined;
    /** Indicates if items in a table or grid are sorted in ascending or descending order. */
    "aria-sort"?: "none" | "ascending" | "descending" | "other" | undefined;
    /** Defines the maximum allowed value for a range widget. */
    "aria-valuemax"?: number | undefined;
    /** Defines the minimum allowed value for a range widget. */
    "aria-valuemin"?: number | undefined;
    /**
     * Defines the current value for a range widget.
     * @see aria-valuetext.
     */
    "aria-valuenow"?: number | undefined;
    /** Defines the human readable text alternative of aria-valuenow for a range widget. */
    "aria-valuetext"?: string | undefined;
}
type AriaRole = "alert" | "alertdialog" | "application" | "article" | "banner" | "button" | "cell" | "checkbox" | "columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "dialog" | "directory" | "document" | "feed" | "figure" | "form" | "grid" | "gridcell" | "group" | "heading" | "img" | "link" | "list" | "listbox" | "listitem" | "log" | "main" | "marquee" | "math" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "navigation" | "none" | "note" | "option" | "presentation" | "progressbar" | "radio" | "radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" | "separator" | "slider" | "spinbutton" | "status" | "switch" | "tab" | "table" | "tablist" | "tabpanel" | "term" | "textbox" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem" | (string & object);
interface EventHandler<E extends Event = Event> {
    (event: E): void;
}
export interface DOMAttributes {
    onCopy?: EventHandler<ClipboardEvent> | undefined;
    onCopyCapture?: EventHandler<ClipboardEvent> | undefined;
    onCut?: EventHandler<ClipboardEvent> | undefined;
    onCutCapture?: EventHandler<ClipboardEvent> | undefined;
    onPaste?: EventHandler<ClipboardEvent> | undefined;
    onPasteCapture?: EventHandler<ClipboardEvent> | undefined;
    onCompositionEnd?: EventHandler<CompositionEvent> | undefined;
    onCompositionEndCapture?: EventHandler<CompositionEvent> | undefined;
    onCompositionStart?: EventHandler<CompositionEvent> | undefined;
    onCompositionStartCapture?: EventHandler<CompositionEvent> | undefined;
    onCompositionUpdate?: EventHandler<CompositionEvent> | undefined;
    onCompositionUpdateCapture?: EventHandler<CompositionEvent> | undefined;
    onFocus?: EventHandler<FocusEvent> | undefined;
    onFocusCapture?: EventHandler<FocusEvent> | undefined;
    onBlur?: EventHandler<FocusEvent> | undefined;
    onBlurCapture?: EventHandler<FocusEvent> | undefined;
    onChange?: EventHandler<Event> | undefined;
    onChangeCapture?: EventHandler<Event> | undefined;
    onBeforeInput?: EventHandler<Event> | undefined;
    onBeforeInputCapture?: EventHandler<Event> | undefined;
    onInput?: EventHandler<Event> | undefined;
    onInputCapture?: EventHandler<Event> | undefined;
    onReset?: EventHandler<Event> | undefined;
    onResetCapture?: EventHandler<Event> | undefined;
    onSubmit?: EventHandler<Event> | undefined;
    onSubmitCapture?: EventHandler<Event> | undefined;
    onInvalid?: EventHandler<Event> | undefined;
    onInvalidCapture?: EventHandler<Event> | undefined;
    onLoad?: EventHandler | undefined;
    onLoadCapture?: EventHandler | undefined;
    onError?: EventHandler | undefined;
    onErrorCapture?: EventHandler | undefined;
    onKeyDown?: EventHandler<KeyboardEvent> | undefined;
    onKeyDownCapture?: EventHandler<KeyboardEvent> | undefined;
    /** @deprecated */
    onKeyPress?: EventHandler<KeyboardEvent> | undefined;
    /** @deprecated */
    onKeyPressCapture?: EventHandler<KeyboardEvent> | undefined;
    onKeyUp?: EventHandler<KeyboardEvent> | undefined;
    onKeyUpCapture?: EventHandler<KeyboardEvent> | undefined;
    onAbort?: EventHandler | undefined;
    onAbortCapture?: EventHandler | undefined;
    onCanPlay?: EventHandler | undefined;
    onCanPlayCapture?: EventHandler | undefined;
    onCanPlayThrough?: EventHandler | undefined;
    onCanPlayThroughCapture?: EventHandler | undefined;
    onDurationChange?: EventHandler | undefined;
    onDurationChangeCapture?: EventHandler | undefined;
    onEmptied?: EventHandler | undefined;
    onEmptiedCapture?: EventHandler | undefined;
    onEncrypted?: EventHandler | undefined;
    onEncryptedCapture?: EventHandler | undefined;
    onEnded?: EventHandler | undefined;
    onEndedCapture?: EventHandler | undefined;
    onLoadedData?: EventHandler | undefined;
    onLoadedDataCapture?: EventHandler | undefined;
    onLoadedMetadata?: EventHandler | undefined;
    onLoadedMetadataCapture?: EventHandler | undefined;
    onLoadStart?: EventHandler | undefined;
    onLoadStartCapture?: EventHandler | undefined;
    onPause?: EventHandler | undefined;
    onPauseCapture?: EventHandler | undefined;
    onPlay?: EventHandler | undefined;
    onPlayCapture?: EventHandler | undefined;
    onPlaying?: EventHandler | undefined;
    onPlayingCapture?: EventHandler | undefined;
    onProgress?: EventHandler | undefined;
    onProgressCapture?: EventHandler | undefined;
    onRateChange?: EventHandler | undefined;
    onRateChangeCapture?: EventHandler | undefined;
    onSeeked?: EventHandler | undefined;
    onSeekedCapture?: EventHandler | undefined;
    onSeeking?: EventHandler | undefined;
    onSeekingCapture?: EventHandler | undefined;
    onStalled?: EventHandler | undefined;
    onStalledCapture?: EventHandler | undefined;
    onSuspend?: EventHandler | undefined;
    onSuspendCapture?: EventHandler | undefined;
    onTimeUpdate?: EventHandler | undefined;
    onTimeUpdateCapture?: EventHandler | undefined;
    onVolumeChange?: EventHandler | undefined;
    onVolumeChangeCapture?: EventHandler | undefined;
    onWaiting?: EventHandler | undefined;
    onWaitingCapture?: EventHandler | undefined;
    onAuxClick?: EventHandler<MouseEvent> | undefined;
    onAuxClickCapture?: EventHandler<MouseEvent> | undefined;
    onClick?: EventHandler<MouseEvent> | undefined;
    onClickCapture?: EventHandler<MouseEvent> | undefined;
    onContextMenu?: EventHandler<MouseEvent> | undefined;
    onContextMenuCapture?: EventHandler<MouseEvent> | undefined;
    onDoubleClick?: EventHandler<MouseEvent> | undefined;
    onDoubleClickCapture?: EventHandler<MouseEvent> | undefined;
    onDrag?: EventHandler<DragEvent> | undefined;
    onDragCapture?: EventHandler<DragEvent> | undefined;
    onDragEnd?: EventHandler<DragEvent> | undefined;
    onDragEndCapture?: EventHandler<DragEvent> | undefined;
    onDragEnter?: EventHandler<DragEvent> | undefined;
    onDragEnterCapture?: EventHandler<DragEvent> | undefined;
    onDragExit?: EventHandler<DragEvent> | undefined;
    onDragExitCapture?: EventHandler<DragEvent> | undefined;
    onDragLeave?: EventHandler<DragEvent> | undefined;
    onDragLeaveCapture?: EventHandler<DragEvent> | undefined;
    onDragOver?: EventHandler<DragEvent> | undefined;
    onDragOverCapture?: EventHandler<DragEvent> | undefined;
    onDragStart?: EventHandler<DragEvent> | undefined;
    onDragStartCapture?: EventHandler<DragEvent> | undefined;
    onDrop?: EventHandler<DragEvent> | undefined;
    onDropCapture?: EventHandler<DragEvent> | undefined;
    onMouseDown?: EventHandler<MouseEvent> | undefined;
    onMouseDownCapture?: EventHandler<MouseEvent> | undefined;
    onMouseEnter?: EventHandler<MouseEvent> | undefined;
    onMouseLeave?: EventHandler<MouseEvent> | undefined;
    onMouseMove?: EventHandler<MouseEvent> | undefined;
    onMouseMoveCapture?: EventHandler<MouseEvent> | undefined;
    onMouseOut?: EventHandler<MouseEvent> | undefined;
    onMouseOutCapture?: EventHandler<MouseEvent> | undefined;
    onMouseOver?: EventHandler<MouseEvent> | undefined;
    onMouseOverCapture?: EventHandler<MouseEvent> | undefined;
    onMouseUp?: EventHandler<MouseEvent> | undefined;
    onMouseUpCapture?: EventHandler<MouseEvent> | undefined;
    onSelect?: EventHandler | undefined;
    onSelectCapture?: EventHandler | undefined;
    onTouchCancel?: EventHandler<TouchEvent> | undefined;
    onTouchCancelCapture?: EventHandler<TouchEvent> | undefined;
    onTouchEnd?: EventHandler<TouchEvent> | undefined;
    onTouchEndCapture?: EventHandler<TouchEvent> | undefined;
    onTouchMove?: EventHandler<TouchEvent> | undefined;
    onTouchMoveCapture?: EventHandler<TouchEvent> | undefined;
    onTouchStart?: EventHandler<TouchEvent> | undefined;
    onTouchStartCapture?: EventHandler<TouchEvent> | undefined;
    onPointerDown?: EventHandler<PointerEvent> | undefined;
    onPointerDownCapture?: EventHandler<PointerEvent> | undefined;
    onPointerMove?: EventHandler<PointerEvent> | undefined;
    onPointerMoveCapture?: EventHandler<PointerEvent> | undefined;
    onPointerUp?: EventHandler<PointerEvent> | undefined;
    onPointerUpCapture?: EventHandler<PointerEvent> | undefined;
    onPointerCancel?: EventHandler<PointerEvent> | undefined;
    onPointerCancelCapture?: EventHandler<PointerEvent> | undefined;
    onPointerEnter?: EventHandler<PointerEvent> | undefined;
    onPointerEnterCapture?: EventHandler<PointerEvent> | undefined;
    onPointerLeave?: EventHandler<PointerEvent> | undefined;
    onPointerLeaveCapture?: EventHandler<PointerEvent> | undefined;
    onPointerOver?: EventHandler<PointerEvent> | undefined;
    onPointerOverCapture?: EventHandler<PointerEvent> | undefined;
    onPointerOut?: EventHandler<PointerEvent> | undefined;
    onPointerOutCapture?: EventHandler<PointerEvent> | undefined;
    onGotPointerCapture?: EventHandler<PointerEvent> | undefined;
    onGotPointerCaptureCapture?: EventHandler<PointerEvent> | undefined;
    onLostPointerCapture?: EventHandler<PointerEvent> | undefined;
    onLostPointerCaptureCapture?: EventHandler<PointerEvent> | undefined;
    onScroll?: EventHandler<UIEvent> | undefined;
    onScrollCapture?: EventHandler<UIEvent> | undefined;
    onWheel?: EventHandler<WheelEvent> | undefined;
    onWheelCapture?: EventHandler<WheelEvent> | undefined;
    onAnimationStart?: EventHandler<AnimationEvent> | undefined;
    onAnimationStartCapture?: EventHandler<AnimationEvent> | undefined;
    onAnimationEnd?: EventHandler<AnimationEvent> | undefined;
    onAnimationEndCapture?: EventHandler<AnimationEvent> | undefined;
    onAnimationIteration?: EventHandler<AnimationEvent> | undefined;
    onAnimationIterationCapture?: EventHandler<AnimationEvent> | undefined;
    onTransitionEnd?: EventHandler<TransitionEvent> | undefined;
    onTransitionEndCapture?: EventHandler<TransitionEvent> | undefined;
}
export interface ReactiveAttributes<T> {
    ref?: State<T | null>;
    children?: VanNode;
    key?: Key;
}
export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes, ReactiveAttributes<T> {
    accessKey?: string | undefined;
    autoFocus?: boolean | undefined;
    className?: string | undefined;
    contentEditable?: Booleanish | "inherit" | undefined;
    contextMenu?: string | undefined;
    dir?: string | undefined;
    draggable?: Booleanish | undefined;
    hidden?: boolean | undefined;
    id?: string | undefined;
    lang?: string | undefined;
    nonce?: string | undefined;
    placeholder?: string | undefined;
    slot?: string | undefined;
    spellCheck?: Booleanish | undefined;
    style?: CSS.Properties | undefined;
    tabIndex?: number | undefined;
    title?: string | undefined;
    translate?: "yes" | "no" | undefined;
    radioGroup?: string | undefined;
    role?: AriaRole | undefined;
    about?: string | undefined;
    content?: string | undefined;
    datatype?: string | undefined;
    inlist?: unknown;
    prefix?: string | undefined;
    property?: string | undefined;
    rel?: string | undefined;
    resource?: string | undefined;
    rev?: string | undefined;
    typeof?: string | undefined;
    vocab?: string | undefined;
    autoCapitalize?: string | undefined;
    autoCorrect?: string | undefined;
    autoSave?: string | undefined;
    color?: string | undefined;
    itemProp?: string | undefined;
    itemScope?: boolean | undefined;
    itemType?: string | undefined;
    itemID?: string | undefined;
    itemRef?: string | undefined;
    results?: number | undefined;
    security?: string | undefined;
    unselectable?: "on" | "off" | undefined;
    /**
     * Hints at the type of data that might be entered by the user while editing the element or its contents
     * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
     */
    inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | undefined;
    /**
     * Specify that a standard HTML element should behave like a defined custom built-in element
     * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
     */
    is?: string | undefined;
}
export interface SVGAttributes<T> extends AriaAttributes, DOMAttributes, ReactiveAttributes<T> {
    className?: string | undefined;
    color?: string | undefined;
    height?: number | string | undefined;
    id?: string | undefined;
    lang?: string | undefined;
    max?: number | string | undefined;
    media?: string | undefined;
    method?: string | undefined;
    min?: number | string | undefined;
    name?: string | undefined;
    style?: CSS.Properties | undefined;
    target?: string | undefined;
    type?: string | undefined;
    width?: number | string | undefined;
    role?: AriaRole | undefined;
    tabIndex?: number | undefined;
    crossOrigin?: CrossOrigin;
    accentHeight?: number | string | undefined;
    accumulate?: "none" | "sum" | undefined;
    additive?: "replace" | "sum" | undefined;
    alignmentBaseline?: "auto" | "baseline" | "before-edge" | "text-before-edge" | "middle" | "central" | "after-edge" | "text-after-edge" | "ideographic" | "alphabetic" | "hanging" | "mathematical" | "inherit" | undefined;
    allowReorder?: "no" | "yes" | undefined;
    alphabetic?: number | string | undefined;
    amplitude?: number | string | undefined;
    arabicForm?: "initial" | "medial" | "terminal" | "isolated" | undefined;
    ascent?: number | string | undefined;
    attributeName?: string | undefined;
    attributeType?: string | undefined;
    autoReverse?: Booleanish | undefined;
    azimuth?: number | string | undefined;
    baseFrequency?: number | string | undefined;
    baselineShift?: number | string | undefined;
    baseProfile?: number | string | undefined;
    bbox?: number | string | undefined;
    begin?: number | string | undefined;
    bias?: number | string | undefined;
    by?: number | string | undefined;
    calcMode?: number | string | undefined;
    capHeight?: number | string | undefined;
    clip?: number | string | undefined;
    clipPath?: string | undefined;
    clipPathUnits?: number | string | undefined;
    clipRule?: number | string | undefined;
    colorInterpolation?: number | string | undefined;
    colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit" | undefined;
    colorProfile?: number | string | undefined;
    colorRendering?: number | string | undefined;
    contentScriptType?: number | string | undefined;
    contentStyleType?: number | string | undefined;
    cursor?: number | string | undefined;
    cx?: number | string | undefined;
    cy?: number | string | undefined;
    d?: string | undefined;
    decelerate?: number | string | undefined;
    descent?: number | string | undefined;
    diffuseConstant?: number | string | undefined;
    direction?: number | string | undefined;
    display?: number | string | undefined;
    divisor?: number | string | undefined;
    dominantBaseline?: number | string | undefined;
    dur?: number | string | undefined;
    dx?: number | string | undefined;
    dy?: number | string | undefined;
    edgeMode?: number | string | undefined;
    elevation?: number | string | undefined;
    enableBackground?: number | string | undefined;
    end?: number | string | undefined;
    exponent?: number | string | undefined;
    externalResourcesRequired?: Booleanish | undefined;
    fill?: string | undefined;
    fillOpacity?: number | string | undefined;
    fillRule?: "nonzero" | "evenodd" | "inherit" | undefined;
    filter?: string | undefined;
    filterRes?: number | string | undefined;
    filterUnits?: number | string | undefined;
    floodColor?: number | string | undefined;
    floodOpacity?: number | string | undefined;
    focusable?: Booleanish | "auto" | undefined;
    fontFamily?: string | undefined;
    fontSize?: number | string | undefined;
    fontSizeAdjust?: number | string | undefined;
    fontStretch?: number | string | undefined;
    fontStyle?: number | string | undefined;
    fontVariant?: number | string | undefined;
    fontWeight?: number | string | undefined;
    format?: number | string | undefined;
    fr?: number | string | undefined;
    from?: number | string | undefined;
    fx?: number | string | undefined;
    fy?: number | string | undefined;
    g1?: number | string | undefined;
    g2?: number | string | undefined;
    glyphName?: number | string | undefined;
    glyphOrientationHorizontal?: number | string | undefined;
    glyphOrientationVertical?: number | string | undefined;
    glyphRef?: number | string | undefined;
    gradientTransform?: string | undefined;
    gradientUnits?: string | undefined;
    hanging?: number | string | undefined;
    horizAdvX?: number | string | undefined;
    horizOriginX?: number | string | undefined;
    href?: string | undefined;
    ideographic?: number | string | undefined;
    imageRendering?: number | string | undefined;
    in2?: number | string | undefined;
    in?: string | undefined;
    intercept?: number | string | undefined;
    k1?: number | string | undefined;
    k2?: number | string | undefined;
    k3?: number | string | undefined;
    k4?: number | string | undefined;
    k?: number | string | undefined;
    kernelMatrix?: number | string | undefined;
    kernelUnitLength?: number | string | undefined;
    kerning?: number | string | undefined;
    keyPoints?: number | string | undefined;
    keySplines?: number | string | undefined;
    keyTimes?: number | string | undefined;
    lengthAdjust?: number | string | undefined;
    letterSpacing?: number | string | undefined;
    lightingColor?: number | string | undefined;
    limitingConeAngle?: number | string | undefined;
    local?: number | string | undefined;
    markerEnd?: string | undefined;
    markerHeight?: number | string | undefined;
    markerMid?: string | undefined;
    markerStart?: string | undefined;
    markerUnits?: number | string | undefined;
    markerWidth?: number | string | undefined;
    mask?: string | undefined;
    maskContentUnits?: number | string | undefined;
    maskUnits?: number | string | undefined;
    mathematical?: number | string | undefined;
    mode?: number | string | undefined;
    numOctaves?: number | string | undefined;
    offset?: number | string | undefined;
    opacity?: number | string | undefined;
    operator?: number | string | undefined;
    order?: number | string | undefined;
    orient?: number | string | undefined;
    orientation?: number | string | undefined;
    origin?: number | string | undefined;
    overflow?: number | string | undefined;
    overlinePosition?: number | string | undefined;
    overlineThickness?: number | string | undefined;
    paintOrder?: number | string | undefined;
    panose1?: number | string | undefined;
    path?: string | undefined;
    pathLength?: number | string | undefined;
    patternContentUnits?: string | undefined;
    patternTransform?: number | string | undefined;
    patternUnits?: string | undefined;
    pointerEvents?: number | string | undefined;
    points?: string | undefined;
    pointsAtX?: number | string | undefined;
    pointsAtY?: number | string | undefined;
    pointsAtZ?: number | string | undefined;
    preserveAlpha?: Booleanish | undefined;
    preserveAspectRatio?: string | undefined;
    primitiveUnits?: number | string | undefined;
    r?: number | string | undefined;
    radius?: number | string | undefined;
    refX?: number | string | undefined;
    refY?: number | string | undefined;
    renderingIntent?: number | string | undefined;
    repeatCount?: number | string | undefined;
    repeatDur?: number | string | undefined;
    requiredExtensions?: number | string | undefined;
    requiredFeatures?: number | string | undefined;
    restart?: number | string | undefined;
    result?: string | undefined;
    rotate?: number | string | undefined;
    rx?: number | string | undefined;
    ry?: number | string | undefined;
    scale?: number | string | undefined;
    seed?: number | string | undefined;
    shapeRendering?: number | string | undefined;
    slope?: number | string | undefined;
    spacing?: number | string | undefined;
    specularConstant?: number | string | undefined;
    specularExponent?: number | string | undefined;
    speed?: number | string | undefined;
    spreadMethod?: string | undefined;
    startOffset?: number | string | undefined;
    stdDeviation?: number | string | undefined;
    stemh?: number | string | undefined;
    stemv?: number | string | undefined;
    stitchTiles?: number | string | undefined;
    stopColor?: string | undefined;
    stopOpacity?: number | string | undefined;
    strikethroughPosition?: number | string | undefined;
    strikethroughThickness?: number | string | undefined;
    string?: number | string | undefined;
    stroke?: string | undefined;
    strokeDasharray?: string | number | undefined;
    strokeDashoffset?: string | number | undefined;
    strokeLinecap?: "butt" | "round" | "square" | "inherit" | undefined;
    strokeLinejoin?: "miter" | "round" | "bevel" | "inherit" | undefined;
    strokeMiterlimit?: number | string | undefined;
    strokeOpacity?: number | string | undefined;
    strokeWidth?: number | string | undefined;
    surfaceScale?: number | string | undefined;
    systemLanguage?: number | string | undefined;
    tableValues?: number | string | undefined;
    targetX?: number | string | undefined;
    targetY?: number | string | undefined;
    textAnchor?: string | undefined;
    textDecoration?: number | string | undefined;
    textLength?: number | string | undefined;
    textRendering?: number | string | undefined;
    to?: number | string | undefined;
    transform?: string | undefined;
    u1?: number | string | undefined;
    u2?: number | string | undefined;
    underlinePosition?: number | string | undefined;
    underlineThickness?: number | string | undefined;
    unicode?: number | string | undefined;
    unicodeBidi?: number | string | undefined;
    unicodeRange?: number | string | undefined;
    unitsPerEm?: number | string | undefined;
    vAlphabetic?: number | string | undefined;
    values?: string | undefined;
    vectorEffect?: number | string | undefined;
    version?: string | undefined;
    vertAdvY?: number | string | undefined;
    vertOriginX?: number | string | undefined;
    vertOriginY?: number | string | undefined;
    vHanging?: number | string | undefined;
    vIdeographic?: number | string | undefined;
    viewBox?: string | undefined;
    viewTarget?: number | string | undefined;
    visibility?: number | string | undefined;
    vMathematical?: number | string | undefined;
    widths?: number | string | undefined;
    wordSpacing?: number | string | undefined;
    writingMode?: number | string | undefined;
    x1?: number | string | undefined;
    x2?: number | string | undefined;
    x?: number | string | undefined;
    xChannelSelector?: string | undefined;
    xHeight?: number | string | undefined;
    xlinkActuate?: string | undefined;
    xlinkArcrole?: string | undefined;
    xlinkHref?: string | undefined;
    xlinkRole?: string | undefined;
    xlinkShow?: string | undefined;
    xlinkTitle?: string | undefined;
    xlinkType?: string | undefined;
    xmlBase?: string | undefined;
    xmlLang?: string | undefined;
    xmlns?: string | undefined;
    xmlnsXlink?: string | undefined;
    xmlSpace?: string | undefined;
    y1?: number | string | undefined;
    y2?: number | string | undefined;
    y?: number | string | undefined;
    yChannelSelector?: string | undefined;
    z?: number | string | undefined;
    zoomAndPan?: string | undefined;
}
type HTMLAttributeAnchorTarget = "_self" | "_blank" | "_parent" | "_top" | (string & object);
type HTMLAttributeReferrerPolicy = "" | "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
export interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    download?: unknown;
    href?: string | undefined;
    hrefLang?: string | undefined;
    media?: string | undefined;
    ping?: string | undefined;
    target?: HTMLAttributeAnchorTarget | undefined;
    type?: string | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
}
export interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string | undefined;
    coords?: string | undefined;
    download?: unknown;
    href?: string | undefined;
    hrefLang?: string | undefined;
    media?: string | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
    shape?: string | undefined;
    target?: string | undefined;
}
export interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoPlay?: boolean | undefined;
    controls?: boolean | undefined;
    controlsList?: string | undefined;
    crossOrigin?: CrossOrigin;
    loop?: boolean | undefined;
    mediaGroup?: string | undefined;
    muted?: boolean | undefined;
    playsInline?: boolean | undefined;
    preload?: string | undefined;
    src?: string | undefined;
}
export interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {
}
export interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string | undefined;
    target?: string | undefined;
}
export interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined;
}
export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | undefined;
    form?: string | undefined;
    formAction?: string | undefined;
    formEncType?: string | undefined;
    formMethod?: string | undefined;
    formNoValidate?: boolean | undefined;
    formTarget?: string | undefined;
    name?: string | undefined;
    type?: "submit" | "reset" | "button" | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | undefined;
    width?: number | string | undefined;
}
export interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: number | undefined;
    width?: number | string | undefined;
}
export interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: number | undefined;
}
export interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
    open?: boolean | undefined;
    onToggle?: Event | undefined;
}
export interface DelHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined;
    dateTime?: string | undefined;
}
export interface DialogHTMLAttributes<T> extends HTMLAttributes<T> {
    onCancel?: Event | undefined;
    onClose?: Event | undefined;
    open?: boolean | undefined;
}
export interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | undefined;
    src?: string | undefined;
    type?: string | undefined;
    width?: number | string | undefined;
}
export interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | undefined;
    form?: string | undefined;
    name?: string | undefined;
}
export interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    acceptCharset?: string | undefined;
    action?: string | undefined;
    autoComplete?: string | undefined;
    encType?: string | undefined;
    method?: string | undefined;
    name?: string | undefined;
    noValidate?: boolean | undefined;
    target?: string | undefined;
}
export interface HtmlHTMLAttributes<T> extends HTMLAttributes<T> {
    manifest?: string | undefined;
}
export interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
    allow?: string | undefined;
    allowFullScreen?: boolean | undefined;
    allowTransparency?: boolean | undefined;
    /** @deprecated */
    frameBorder?: number | string | undefined;
    height?: number | string | undefined;
    loading?: "eager" | "lazy" | undefined;
    /** @deprecated */
    marginHeight?: number | undefined;
    /** @deprecated */
    marginWidth?: number | undefined;
    name?: string | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
    sandbox?: string | undefined;
    /** @deprecated */
    scrolling?: string | undefined;
    seamless?: boolean | undefined;
    src?: string | undefined;
    srcDoc?: string | undefined;
    width?: number | string | undefined;
}
export interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string | undefined;
    crossOrigin?: CrossOrigin;
    decoding?: "async" | "auto" | "sync" | undefined;
    height?: number | string | undefined;
    loading?: "eager" | "lazy" | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
    sizes?: string | undefined;
    src?: string | undefined;
    srcSet?: string | undefined;
    useMap?: string | undefined;
    width?: number | string | undefined;
}
export interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined;
    dateTime?: string | undefined;
}
type HTMLInputTypeAttribute = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week" | (string & object);
export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    accept?: string | undefined;
    alt?: string | undefined;
    autoComplete?: string | undefined;
    capture?: boolean | "user" | "environment" | undefined;
    checked?: boolean | undefined;
    disabled?: boolean | undefined;
    enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send" | undefined;
    form?: string | undefined;
    formAction?: string | undefined;
    formEncType?: string | undefined;
    formMethod?: string | undefined;
    formNoValidate?: boolean | undefined;
    formTarget?: string | undefined;
    height?: number | string | undefined;
    list?: string | undefined;
    max?: number | string | undefined;
    maxLength?: number | undefined;
    min?: number | string | undefined;
    minLength?: number | undefined;
    multiple?: boolean | undefined;
    name?: string | undefined;
    pattern?: string | undefined;
    placeholder?: string | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    size?: number | undefined;
    src?: string | undefined;
    step?: number | string | undefined;
    type?: HTMLInputTypeAttribute | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
    width?: number | string | undefined;
    onChange?: EventHandler<Event> | undefined;
}
export interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
    challenge?: string | undefined;
    disabled?: boolean | undefined;
    form?: string | undefined;
    keyType?: string | undefined;
    keyParams?: string | undefined;
    name?: string | undefined;
}
export interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | undefined;
    htmlFor?: string | undefined;
}
export interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
    as?: string | undefined;
    crossOrigin?: CrossOrigin;
    fetchPriority?: "high" | "low" | "auto";
    href?: string | undefined;
    hrefLang?: string | undefined;
    integrity?: string | undefined;
    media?: string | undefined;
    imageSrcSet?: string | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
    sizes?: string | undefined;
    type?: string | undefined;
    charSet?: string | undefined;
}
export interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | undefined;
}
export interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string | undefined;
}
export interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
    charSet?: string | undefined;
    httpEquiv?: string | undefined;
    name?: string | undefined;
    media?: string | undefined;
}
export interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | undefined;
    high?: number | undefined;
    low?: number | undefined;
    max?: number | string | undefined;
    min?: number | string | undefined;
    optimum?: number | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: string | undefined;
}
export interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
    classID?: string | undefined;
    data?: string | undefined;
    form?: string | undefined;
    height?: number | string | undefined;
    name?: string | undefined;
    type?: string | undefined;
    useMap?: string | undefined;
    width?: number | string | undefined;
    wmode?: string | undefined;
}
export interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
    reversed?: boolean | undefined;
    start?: number | undefined;
    type?: "1" | "a" | "A" | "i" | "I" | undefined;
}
export interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | undefined;
    label?: string | undefined;
}
export interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean | undefined;
    label?: string | undefined;
    selected?: boolean | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: string | undefined;
    htmlFor?: string | undefined;
    name?: string | undefined;
}
export interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
    max?: number | string | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
}
export interface SlotHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string | undefined;
}
export interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
    async?: boolean | undefined;
    /** @deprecated */
    charSet?: string | undefined;
    crossOrigin?: CrossOrigin;
    defer?: boolean | undefined;
    integrity?: string | undefined;
    noModule?: boolean | undefined;
    referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
    src?: string | undefined;
    type?: string | undefined;
}
export interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: string | undefined;
    disabled?: boolean | undefined;
    form?: string | undefined;
    multiple?: boolean | undefined;
    name?: string | undefined;
    required?: boolean | undefined;
    size?: number | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
    onChange?: EventHandler<Event> | undefined;
}
export interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: number | string | undefined;
    media?: string | undefined;
    sizes?: string | undefined;
    src?: string | undefined;
    srcSet?: string | undefined;
    type?: string | undefined;
    width?: number | string | undefined;
}
export interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    media?: string | undefined;
    scoped?: boolean | undefined;
    type?: string | undefined;
}
export interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
    cellPadding?: number | string | undefined;
    cellSpacing?: number | string | undefined;
    summary?: string | undefined;
    width?: number | string | undefined;
}
export interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: string | undefined;
    cols?: number | undefined;
    dirName?: string | undefined;
    disabled?: boolean | undefined;
    form?: string | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    name?: string | undefined;
    placeholder?: string | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    rows?: number | undefined;
    value?: string | ReadonlyArray<string> | number | undefined;
    wrap?: string | undefined;
    onChange?: EventHandler<Event> | undefined;
}
export interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: "left" | "center" | "right" | "justify" | "char" | undefined;
    colSpan?: number | undefined;
    headers?: string | undefined;
    rowSpan?: number | undefined;
    scope?: string | undefined;
    abbr?: string | undefined;
    height?: number | string | undefined;
    width?: number | string | undefined;
    valign?: "top" | "middle" | "bottom" | "baseline" | undefined;
}
export interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: "left" | "center" | "right" | "justify" | "char" | undefined;
    colSpan?: number | undefined;
    headers?: string | undefined;
    rowSpan?: number | undefined;
    scope?: string | undefined;
    abbr?: string | undefined;
}
export interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
    dateTime?: string | undefined;
}
export interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
    default?: boolean | undefined;
    kind?: string | undefined;
    label?: string | undefined;
    src?: string | undefined;
    srcLang?: string | undefined;
}
export interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
    height?: number | string | undefined;
    playsInline?: boolean | undefined;
    poster?: string | undefined;
    width?: number | string | undefined;
    disablePictureInPicture?: boolean | undefined;
    disableRemotePlayback?: boolean | undefined;
}
export interface WebViewHTMLAttributes<T> extends HTMLAttributes<T> {
    allowFullScreen?: boolean | undefined;
    allowpopups?: boolean | undefined;
    autosize?: boolean | undefined;
    blinkfeatures?: string | undefined;
    disableblinkfeatures?: string | undefined;
    disableguestresize?: boolean | undefined;
    disablewebsecurity?: boolean | undefined;
    guestinstance?: string | undefined;
    httpreferrer?: string | undefined;
    nodeintegration?: boolean | undefined;
    partition?: string | undefined;
    plugins?: boolean | undefined;
    preload?: string | undefined;
    src?: string | undefined;
    useragent?: string | undefined;
    webpreferences?: string | undefined;
}
export interface InnerElement {
    a: AnchorHTMLAttributes<HTMLAnchorElement>;
    abbr: HTMLAttributes<HTMLElement>;
    address: HTMLAttributes<HTMLElement>;
    area: AreaHTMLAttributes<HTMLAreaElement>;
    article: HTMLAttributes<HTMLElement>;
    aside: HTMLAttributes<HTMLElement>;
    audio: AudioHTMLAttributes<HTMLAudioElement>;
    b: HTMLAttributes<HTMLElement>;
    base: BaseHTMLAttributes<HTMLBaseElement>;
    bdi: HTMLAttributes<HTMLElement>;
    bdo: HTMLAttributes<HTMLElement>;
    big: HTMLAttributes<HTMLElement>;
    blockquote: BlockquoteHTMLAttributes<HTMLQuoteElement>;
    body: HTMLAttributes<HTMLBodyElement>;
    br: HTMLAttributes<HTMLBRElement>;
    button: ButtonHTMLAttributes<HTMLButtonElement>;
    canvas: CanvasHTMLAttributes<HTMLCanvasElement>;
    caption: HTMLAttributes<HTMLElement>;
    cite: HTMLAttributes<HTMLElement>;
    code: HTMLAttributes<HTMLElement>;
    col: ColHTMLAttributes<HTMLTableColElement>;
    colgroup: ColgroupHTMLAttributes<HTMLTableColElement>;
    data: DataHTMLAttributes<HTMLDataElement>;
    datalist: HTMLAttributes<HTMLDataListElement>;
    dd: HTMLAttributes<HTMLElement>;
    del: DelHTMLAttributes<HTMLModElement>;
    details: DetailsHTMLAttributes<HTMLDetailsElement>;
    dfn: HTMLAttributes<HTMLElement>;
    dialog: DialogHTMLAttributes<HTMLDialogElement>;
    div: HTMLAttributes<HTMLDivElement>;
    dl: HTMLAttributes<HTMLDListElement>;
    dt: HTMLAttributes<HTMLElement>;
    em: HTMLAttributes<HTMLElement>;
    embed: EmbedHTMLAttributes<HTMLEmbedElement>;
    fieldset: FieldsetHTMLAttributes<HTMLFieldSetElement>;
    figcaption: HTMLAttributes<HTMLElement>;
    figure: HTMLAttributes<HTMLElement>;
    footer: HTMLAttributes<HTMLElement>;
    form: FormHTMLAttributes<HTMLFormElement>;
    h1: HTMLAttributes<HTMLHeadingElement>;
    h2: HTMLAttributes<HTMLHeadingElement>;
    h3: HTMLAttributes<HTMLHeadingElement>;
    h4: HTMLAttributes<HTMLHeadingElement>;
    h5: HTMLAttributes<HTMLHeadingElement>;
    h6: HTMLAttributes<HTMLHeadingElement>;
    head: HTMLAttributes<HTMLHeadElement>;
    header: HTMLAttributes<HTMLElement>;
    hgroup: HTMLAttributes<HTMLElement>;
    hr: HTMLAttributes<HTMLHRElement>;
    html: HtmlHTMLAttributes<HTMLHtmlElement>;
    i: HTMLAttributes<HTMLElement>;
    iframe: IframeHTMLAttributes<HTMLIFrameElement>;
    img: ImgHTMLAttributes<HTMLImageElement>;
    input: InputHTMLAttributes<HTMLInputElement>;
    ins: InsHTMLAttributes<HTMLModElement>;
    kbd: HTMLAttributes<HTMLElement>;
    keygen: KeygenHTMLAttributes<HTMLElement>;
    label: LabelHTMLAttributes<HTMLLabelElement>;
    legend: HTMLAttributes<HTMLLegendElement>;
    li: LiHTMLAttributes<HTMLLIElement>;
    link: LinkHTMLAttributes<HTMLLinkElement>;
    main: HTMLAttributes<HTMLElement>;
    map: MapHTMLAttributes<HTMLMapElement>;
    mark: HTMLAttributes<HTMLElement>;
    menu: MenuHTMLAttributes<HTMLElement>;
    menuitem: HTMLAttributes<HTMLElement>;
    meta: MetaHTMLAttributes<HTMLMetaElement>;
    meter: MeterHTMLAttributes<HTMLMeterElement>;
    nav: HTMLAttributes<HTMLElement>;
    noindex: HTMLAttributes<HTMLElement>;
    noscript: HTMLAttributes<HTMLElement>;
    object: ObjectHTMLAttributes<HTMLObjectElement>;
    ol: OlHTMLAttributes<HTMLOListElement>;
    optgroup: OptgroupHTMLAttributes<HTMLOptGroupElement>;
    option: OptionHTMLAttributes<HTMLOptionElement>;
    output: OutputHTMLAttributes<HTMLOutputElement>;
    p: HTMLAttributes<HTMLParagraphElement>;
    param: ParamHTMLAttributes<HTMLParamElement>;
    picture: HTMLAttributes<HTMLElement>;
    pre: HTMLAttributes<HTMLPreElement>;
    progress: ProgressHTMLAttributes<HTMLProgressElement>;
    q: QuoteHTMLAttributes<HTMLQuoteElement>;
    rp: HTMLAttributes<HTMLElement>;
    rt: HTMLAttributes<HTMLElement>;
    ruby: HTMLAttributes<HTMLElement>;
    s: HTMLAttributes<HTMLElement>;
    samp: HTMLAttributes<HTMLElement>;
    slot: SlotHTMLAttributes<HTMLSlotElement>;
    script: ScriptHTMLAttributes<HTMLScriptElement>;
    section: HTMLAttributes<HTMLElement>;
    select: SelectHTMLAttributes<HTMLSelectElement>;
    small: HTMLAttributes<HTMLElement>;
    source: SourceHTMLAttributes<HTMLSourceElement>;
    span: HTMLAttributes<HTMLSpanElement>;
    strong: HTMLAttributes<HTMLElement>;
    style: StyleHTMLAttributes<HTMLStyleElement>;
    sub: HTMLAttributes<HTMLElement>;
    summary: HTMLAttributes<HTMLElement>;
    sup: HTMLAttributes<HTMLElement>;
    table: TableHTMLAttributes<HTMLTableElement>;
    template: HTMLAttributes<HTMLTemplateElement>;
    tbody: HTMLAttributes<HTMLTableSectionElement>;
    td: TdHTMLAttributes<HTMLTableDataCellElement>;
    textarea: TextareaHTMLAttributes<HTMLTextAreaElement>;
    tfoot: HTMLAttributes<HTMLTableSectionElement>;
    th: ThHTMLAttributes<HTMLTableHeaderCellElement>;
    thead: HTMLAttributes<HTMLTableSectionElement>;
    time: TimeHTMLAttributes<HTMLTimeElement>;
    title: HTMLAttributes<HTMLTitleElement>;
    tr: HTMLAttributes<HTMLTableRowElement>;
    track: TrackHTMLAttributes<HTMLTrackElement>;
    u: HTMLAttributes<HTMLElement>;
    ul: HTMLAttributes<HTMLUListElement>;
    var: HTMLAttributes<HTMLElement>;
    video: VideoHTMLAttributes<HTMLVideoElement>;
    wbr: HTMLAttributes<HTMLElement>;
    webview: WebViewHTMLAttributes<HTMLElement>;
    svg: SVGAttributes<SVGSVGElement>;
    animate: SVGAttributes<SVGElement>;
    animateMotion: SVGAttributes<SVGElement>;
    animateTransform: SVGAttributes<SVGElement>;
    circle: SVGAttributes<SVGCircleElement>;
    clipPath: SVGAttributes<SVGClipPathElement>;
    defs: SVGAttributes<SVGDefsElement>;
    desc: SVGAttributes<SVGDescElement>;
    ellipse: SVGAttributes<SVGEllipseElement>;
    feBlend: SVGAttributes<SVGFEBlendElement>;
    feColorMatrix: SVGAttributes<SVGFEColorMatrixElement>;
    feComponentTransfer: SVGAttributes<SVGFEComponentTransferElement>;
    feComposite: SVGAttributes<SVGFECompositeElement>;
    feConvolveMatrix: SVGAttributes<SVGFEConvolveMatrixElement>;
    feDiffuseLighting: SVGAttributes<SVGFEDiffuseLightingElement>;
    feDisplacementMap: SVGAttributes<SVGFEDisplacementMapElement>;
    feDistantLight: SVGAttributes<SVGFEDistantLightElement>;
    feDropShadow: SVGAttributes<SVGFEDropShadowElement>;
    feFlood: SVGAttributes<SVGFEFloodElement>;
    feFuncA: SVGAttributes<SVGFEFuncAElement>;
    feFuncB: SVGAttributes<SVGFEFuncBElement>;
    feFuncG: SVGAttributes<SVGFEFuncGElement>;
    feFuncR: SVGAttributes<SVGFEFuncRElement>;
    feGaussianBlur: SVGAttributes<SVGFEGaussianBlurElement>;
    feImage: SVGAttributes<SVGFEImageElement>;
    feMerge: SVGAttributes<SVGFEMergeElement>;
    feMergeNode: SVGAttributes<SVGFEMergeNodeElement>;
    feMorphology: SVGAttributes<SVGFEMorphologyElement>;
    feOffset: SVGAttributes<SVGFEOffsetElement>;
    fePointLight: SVGAttributes<SVGFEPointLightElement>;
    feSpecularLighting: SVGAttributes<SVGFESpecularLightingElement>;
    feSpotLight: SVGAttributes<SVGFESpotLightElement>;
    feTile: SVGAttributes<SVGFETileElement>;
    feTurbulence: SVGAttributes<SVGFETurbulenceElement>;
    filter: SVGAttributes<SVGFilterElement>;
    foreignObject: SVGAttributes<SVGForeignObjectElement>;
    g: SVGAttributes<SVGGElement>;
    image: SVGAttributes<SVGImageElement>;
    line: SVGAttributes<SVGLineElement>;
    linearGradient: SVGAttributes<SVGLinearGradientElement>;
    marker: SVGAttributes<SVGMarkerElement>;
    mask: SVGAttributes<SVGMaskElement>;
    metadata: SVGAttributes<SVGMetadataElement>;
    mpath: SVGAttributes<SVGElement>;
    path: SVGAttributes<SVGPathElement>;
    pattern: SVGAttributes<SVGPatternElement>;
    polygon: SVGAttributes<SVGPolygonElement>;
    polyline: SVGAttributes<SVGPolylineElement>;
    radialGradient: SVGAttributes<SVGRadialGradientElement>;
    rect: SVGAttributes<SVGRectElement>;
    stop: SVGAttributes<SVGStopElement>;
    switch: SVGAttributes<SVGSwitchElement>;
    symbol: SVGAttributes<SVGSymbolElement>;
    text: SVGAttributes<SVGTextElement>;
    textPath: SVGAttributes<SVGTextPathElement>;
    tspan: SVGAttributes<SVGTSpanElement>;
    use: SVGAttributes<SVGUseElement>;
    view: SVGAttributes<SVGViewElement>;
}
type OrVanAttribute<T extends DOMAttributes> = {
    [K in keyof T]: T[K] | (() => T[K]) | State<T[K]>;
};
export type TagOption<K extends keyof InnerElement> = OrVanAttribute<Omit<InnerElement[K], "ref" | "children" | "key">> & Pick<InnerElement[K], "ref" | "children" | "key">;
export {};
