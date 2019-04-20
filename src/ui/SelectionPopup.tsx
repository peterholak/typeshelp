import * as React from 'react'
import * as Rx from 'rxjs'
import { debounce, filter, share, map } from 'rxjs/operators'
import { ThemedStyle, mix, mixWithTheme, Themed } from 'Styles'
import colors from 'colors';

interface State {
    visible: boolean
    left: number
    top: number
    primaryPointerDown: boolean
}

interface Props {
    overlayVisible: boolean
    onPointerTypeDetermined: (pointerType: string) => void
}

interface SelectionData {
    text: string
    edgeRanges: {
        first: Range
        last: Range
    }|undefined
}

export class SelectionPopup extends React.Component<Props, State> {

    popupElement: HTMLElement|null = null

    showSubscription?: Rx.Subscription
    changeSubscription?: Rx.Subscription
    pointerDownSubscription?: Rx.Subscription
    pointerUpSubscription?: Rx.Subscription
    resizeSubscription?: Rx.Subscription

    state = { visible: false, left: 0, top: 0, primaryPointerDown: false }

    componentDidMount() {
        const selectionData = Rx
            .fromEvent(document, 'selectionchange')
            .pipe(
                map(() => this.getSelectionData()),
                share()
            )

        this.showSubscription = selectionData
            .pipe(
                debounce(() => Rx.interval(500)),
                filter(data => data.text !== '' && this.state.visible === false)
            )
            .subscribe(this.onTextNewlySelected)

        this.changeSubscription = selectionData
            .pipe(filter(() => this.state.visible === true))
            .subscribe(this.onTextSelectionChanged)

        this.pointerDownSubscription = Rx
            .fromEvent<PointerEvent>(document, 'pointerdown')
            .subscribe(e => {
                if (e.isPrimary) {
                    const path = e.composedPath()
                    if (path.every(element => element !== this.popupElement)) {
                        this.props.onPointerTypeDetermined(e.pointerType)
                        this.setState({ primaryPointerDown: true })
                    }
                }
            })

        this.pointerUpSubscription = Rx.fromEvent<PointerEvent>(document, 'pointerup')
            .subscribe(e => {
                if (e.isPrimary) {
                    this.setState({ primaryPointerDown: false })
                }
            })

        this.resizeSubscription = Rx.fromEvent(window, 'resize')
            .subscribe(() => {
                if (this.state.visible) {
                    this.onTextSelectionChanged(this.getSelectionData())
                }
            })
    }

    componentWillUnmount() {
        this.showSubscription && this.showSubscription.unsubscribe()
        this.changeSubscription && this.changeSubscription.unsubscribe()
        this.pointerDownSubscription && this.pointerDownSubscription.unsubscribe()
        this.pointerUpSubscription && this.pointerUpSubscription.unsubscribe()
        this.resizeSubscription && this.resizeSubscription.unsubscribe()
    }

    render() {
        return <Themed>{ (_, mixThemed) => <div
            ref={e => this.popupElement = e}
            style={{
                ...mixThemed(
                    popupStyle,
                    [this.state.visible, visibleStyle],
                    [this.state.primaryPointerDown, { pointerEvents: 'none' }]
                ),
                left: this.state.left,
                top: this.state.top
            }}
        >
            {this.props.children}
        </div>}</Themed>
    }

    onTextSelectionChanged = (selection: SelectionData) => {
        if (selection.text === '' || selection.edgeRanges === undefined || this.popupElement === null) {
            this.setState({ visible: false })
            return
        }

        const topLeftRect = this.topLeftRect(selection.edgeRanges.first.getClientRects())
        const bottomRightRect = this.bottomRightRect(selection.edgeRanges.last.getClientRects())

        const visibleArea = {
            top: 0,
            left: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
            width: window.innerWidth,
            height: window.innerHeight
        }

        const topLeftVisible = this.isInArea(topLeftRect, visibleArea)
        const bottomRightVisible = this.isInArea(bottomRightRect, visibleArea)

        let position
        if (bottomRightVisible) {
            position = bottomRightRect && { left: bottomRightRect.left, top: bottomRightRect.bottom }
        }else if (topLeftVisible) {
            position = topLeftRect && { left: topLeftRect.left, top: topLeftRect.top }
        }

        if (position === undefined) {
            this.setState({ visible: false })
            return
        }

        let scrollLeft = 0, scrollTop = 0
        if (document.scrollingElement !== null) {
            scrollLeft = document.scrollingElement.scrollLeft
            scrollTop = document.scrollingElement.scrollTop
        }

        this.setState({
            visible: true,
            left: Math.max(0, position.left + scrollLeft),
            top: Math.max(0, position.top + scrollTop)
        })
    }

    onTextNewlySelected = (selection: SelectionData) => {
        this.setState(
            { visible: true },
            () => this.onTextSelectionChanged(selection)
        )
    }

    getSelectionData(): SelectionData {
        const selection = document.getSelection()

        if (selection === null) {
            return { text: '', edgeRanges: undefined }
        }

        return {
            text: selection.toString(),
            edgeRanges: selection.rangeCount === 0 ? undefined : {
                first: selection.getRangeAt(0),
                last: selection.getRangeAt(selection.rangeCount - 1)
            }
        }
    }

    /** Returns the most bottom-right rect out of a list of rects (e.g. from a list of seletcion ranges). */
    bottomRightRect(rects: ClientRectList|DOMRectList): ClientRect|undefined {
        let bottomRightRect: ClientRect|undefined = undefined
        Array.prototype.forEach.call(rects, (rect: ClientRect|DOMRect) => {
            if (bottomRightRect === undefined || rect.bottom > bottomRightRect.bottom) {
                bottomRightRect = rect
            }
            if (rect.bottom === bottomRightRect.bottom && rect.right > bottomRightRect.right) {
                bottomRightRect = rect
            }
        })
        return bottomRightRect
    }

    /** Returns the most top-left rect out of a list of rects (e.g. from a list of seletcion ranges). */
    topLeftRect(rects: ClientRectList|DOMRectList): ClientRect|undefined {
        let topLeftRect: ClientRect|undefined = undefined
        Array.prototype.forEach.call(rects, (rect: ClientRect|DOMRect) => {
            if (topLeftRect === undefined || rect.top < topLeftRect.top) {
                topLeftRect = rect
            }
            if (rect.top === topLeftRect.top && rect.left < topLeftRect.left) {
                topLeftRect = rect
            }
        })
        return topLeftRect
    }

    isInArea(inner: ClientRect|undefined, outer: ClientRect): boolean {
        if (inner === undefined) return false
        return (inner.right > outer.left && inner.left < outer.right && inner.bottom > outer.top && inner.top < outer.bottom)
    }
}

const popupStyle: ThemedStyle = {
    position: 'absolute',
    border: '1px solid #000',
    background: colors.light.popupBackground,
    display: 'none',
    userSelect: 'none',
    zIndex: 2,
    boxShadow: '1px 1px 15px',
    borderRadius: '0.5em',

    dark: {
        background: colors.dark.popupBackground,
        border: '1px solid #888'
    }
}

const visibleStyle: ThemedStyle = {
    display: 'block'
}

export default SelectionPopup