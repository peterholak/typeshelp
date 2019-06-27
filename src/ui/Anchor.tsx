import * as React from 'react'
import { ExpanderTracking, ExpanderKey, ExpanderState, ExpanderControl } from 'ui/Expander'
import colors from 'colors'
import { ThemedStyle, Themed, ThemedFunction } from 'Styles'

export enum AnchorKey {
    StaticDynamic,
    Inference,
    WholeProgram,
    BlackAndWhite,
    Workflows,
    StructuralNominal,
    Expresiveness,
    WiderNarrower,
    StaticIde,
    Duck,
    Opaque,
    ErrorCloseToRootCause,
    MapsStringKeys,
    Reflection,
    Defensive,
    Initialization,
    NullabilityLimitations,
    Implementation
}

export interface LinkClickState {
    documentScroll: number
}

interface AnchorEntry {
    element: HTMLElement|null
    expanderHierarchy: ExpanderKey[]
    useParent: boolean
}

export type AnchorMap = {[k in AnchorKey]?: AnchorEntry}

interface AnchorContextData {
    map: AnchorMap,
    navigateToAnchor: (key: AnchorKey) => void
}

export const AnchorState = React.createContext<AnchorContextData>({ map: {}, navigateToAnchor: () => {}})

export class Anchor extends React.Component<{ aid: AnchorKey, useParent?: boolean }> {

    render() {
        return <AnchorState.Consumer>{anchorData =>
            <ExpanderTracking.Consumer>{hierarchy =>
                <div ref={e => anchorData.map[this.props.aid] = {
                    element: e,
                    expanderHierarchy: hierarchy,
                    useParent: this.props.useParent || false
                }}>
                    {this.props.children}
                </div>
            }</ExpanderTracking.Consumer>
        }</AnchorState.Consumer>
    }

}

export class LinkTo extends React.Component<{ aid: AnchorKey }> {

    aboveOnFirstRender: boolean|undefined = undefined

    render() {
        return <AnchorState.Consumer>{anchors =>
            <ExpanderState.Consumer>{expanders => {
                return <Themed>{ themed =>
                    <span
                        style={themed(linkStyle)}
                        onClick={(event) => {
                            event.preventDefault()
                            anchors.navigateToAnchor(this.props.aid)
                        }}
                        ref={() => {
                            if (this.aboveOnFirstRender === undefined) {
                                this.aboveOnFirstRender = anchors.map[this.props.aid] !== undefined
                            }
                        }}
                    >
                        {this.props.children}<span style={linkSymbolStyle}>{this.aboveOnFirstRender ? "⤴\ufe0e" : "⤵\ufe0e"}</span>
                    </span>
                }</Themed>
            }}</ExpanderState.Consumer>
        }</AnchorState.Consumer>
    }
}

export enum BackDirection { Above, Below }
export type Size = { width: number, height: number }

interface BackPopupProps {
    themed: ThemedFunction,
    direction: BackDirection|undefined,
    visible: boolean,
    onHide: () => void,
    onBack: () => void,
    onMeasured: (size: Size) => void
}

interface BackPopupState {
    left: number,
    measured: boolean
}

export class BackPopup extends React.Component<BackPopupProps, BackPopupState> {

    static minLeftOffset = 10

    state: BackPopupState = { left: 0, measured: false }
    element: HTMLDivElement|null = null

    componentDidMount() {
        window.addEventListener('resize', this.onWindowResized)
        this.onWindowResized()
        if (this.element !== null) {
            const elementRect = this.element.getBoundingClientRect()
            const size = { width: elementRect.width, height: elementRect.height }
            this.props.onMeasured(size)
            this.setState({ measured: true })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResized)
    }

    componentDidUpdate(prevProps: BackPopupProps) {
        if (prevProps.visible === false && this.props.visible === true) {
            this.onWindowResized()
        }
    }

    onWindowResized = () => {
        if (this.element === null) return

        const documentRect = document.body.getBoundingClientRect()
        const newLeft = Math.max(BackPopup.minLeftOffset, documentRect.left - this.element.clientWidth)
        if (this.state.left !== newLeft)  {
            this.setState({ left: newLeft })
        }
    }

    render() {
        return <div 
            ref={e => this.element = e}
            style={{
                ...this.props.themed(backPopupStyle),
                left: this.state.left,
                display: (this.props.visible || !this.state.measured) ? 'block' : 'none',
                visibility: this.state.measured ? 'visible' : 'hidden'
            }}
        >
            <span onClick={this.props.onBack} style={backPopupBackStyle}>
                {this.props.direction === BackDirection.Above ? '⤴\ufe0e' : '⤵\ufe0e'}
            </span>
            {' '}Back{' '}
            <span onClick={this.props.onHide} style={backPopupXStyle}>{'✖\ufe0e'}</span>
        </div>
    }

}

const linkStyle: ThemedStyle = {
    cursor: 'pointer',
    textDecoration: 'underline dotted',
    dark: {
        color: colors.dark.link
    }
}

const linkSymbolStyle: React.CSSProperties = {
    userSelect: 'none'
}

const backPopupStyle: ThemedStyle = {
    background: colors.light.mainSectionBackground,
    color: '#444',
    position: 'fixed',
    zIndex: 1,
    border: '1px solid #444',
    borderRadius: '0.5em',
    padding: '0.5em',
    userSelect: 'none',
    top: '1em',
    boxShadow: '1px 1px 15px',

    dark: {
        background: colors.dark.mainSectionBackground,
        color: '#fff',
    }
}

const backPopupXStyle = {
    cursor: 'pointer'
}

const backPopupBackStyle = {
    cursor: 'pointer'
}