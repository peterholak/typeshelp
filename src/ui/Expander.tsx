import * as React from 'react'
import * as jQuery from 'jquery'
import * as zenscroll from 'zenscroll'
import highlight from 'ui/highlight'
import { mix, ThemedStyle, Themed, mixWithTheme } from 'Styles'
import colors from 'colors';

enum ExpandState {
    Expand, ExpandNoAnimation, Collapse
}

function toggleState(old: ExpandState|undefined): ExpandState {
    switch (old) {
        case ExpandState.Collapse: return ExpandState.Expand
        case undefined: return ExpandState.Expand
        case ExpandState.Expand: return ExpandState.Collapse
        case ExpandState.ExpandNoAnimation: return ExpandState.Collapse
    }
}

export function isExpanded(state: ExpandState|undefined): boolean {
    return state === ExpandState.Expand || state === ExpandState.ExpandNoAnimation
}

export enum ExpanderKey {
    Focus,
    Feedback,
    StrongWeakExample,
    StructuralNominalExample,
    OtherTerms,
    KotlinReturnTypes,
    DuckMore,
    CompileTime,
    StaticDynamicMore,
    StaticSchema,
    ExampleExplicit,
    StaticDynamicFeatures,
    DynamicStaticAnalysis,
    StaticIde,
    OoInterface,
    Polymorphism,
    StaticCorrect,
    ExampleBranches,
    BranchesBad,
    DynamicModificationPitfalls,
    StaticPrototyping,
    StructuralNominalMore,
    InferenceC,
    InferenceReadability,
    FeedbackSandbox,
    TaggedUnion,
    DesignExampleEnum,
    DesignExampleCombinations,
    DesignExampleInitialization,
    DesignExampleExternalData,
    Contract,
    MapsStringKeys,
    Null,
    ExpressivenessFeatures,
    EaseOfUse,
    ExpressImmutability,
    NullabilityLimitations,
    NullabilityMore,
    NullabilityPointlessCheck,
    PointlessCheckMore,
    NullRedundantChecks,
    NullAnnotations,
    NullPairsValidator,
    Mistakes
}
export type ExpanderMap = { [K in ExpanderKey]?: ExpandState }

export interface ExpanderControl {
    toggle: (key: ExpanderKey) => void
    expandAll: () => void
    expandImmediately: (keys: ExpanderKey[], domCallback?: () => void) => void
}

export interface ExpanderContext {
    data: ExpanderMap
    control: ExpanderControl
}

export const ExpanderState = React.createContext<ExpanderContext>({
    data: {}, control: { toggle: () => {}, expandAll: () => {}, expandImmediately: () => {} }
})

export const ExpanderTracking = React.createContext<ExpanderKey[]>([])

export class ExpanderProvider
    extends React.Component<{}, { map: ExpanderMap }>
    implements ExpanderControl
{
    state: { map: ExpanderMap } = { map: {} }
    callbackQueue: (() => void)[] = []

    render() {
        return <ExpanderState.Provider value={{ data: this.state.map, control: this }}>
            {this.props.children}
        </ExpanderState.Provider>
    }

    componentDidUpdate(prevProps: {}, prevState: { map: ExpanderMap }) {
        this.callbackQueue.forEach(callback => callback())
        this.callbackQueue = []
    }
       
    toggle(key: ExpanderKey) {
        this.setState({ map: { ...this.state.map, [key]: toggleState(this.state.map[key]) } })
    }

    expandAll() {
        let newMap: ExpanderMap = {}
        Object
            .keys(ExpanderKey)
            .filter(key => !isNaN(Number(key)))
            .forEach(key => newMap[Number(key) as ExpanderKey] = ExpandState.ExpandNoAnimation)

        this.setState({ map: newMap })
    }

    expandImmediately(keys: ExpanderKey[], domCallback?: () => void) {
        if (domCallback !== undefined) {
            this.callbackQueue.push(domCallback)
        }

        let newMap = { ...this.state.map }
        keys.forEach(key => newMap[key] = ExpandState.ExpandNoAnimation)
        this.setState({ map: newMap })
    }

}

export class ExpanderLink extends React.Component<{ eid: ExpanderKey, example?: boolean, unimportant?: boolean }> {

    linkExpanded = (context: ExpanderContext) => isExpanded(context.data[this.props.eid])

    render() {
        return <ExpanderState.Consumer>{context =>
            <Themed>{(_, mixThemed) =>
                <span
                    style={mixThemed(
                        styles.expandLink,
                        [this.linkExpanded(context), styles.expandedLink],
                        [this.props.example, styles.exampleLink],
                        [this.props.unimportant, styles.unimportantLink]
                    )}
                    onClick={() => context.control.toggle(this.props.eid)}
                >
                    {this.props.example && '📝' + noEmoji}{this.props.children}
                    {!this.props.unimportant &&
                        <span style={{fontSize: '50%'}}>{this.linkExpanded(context) ? '➖' : '➕'}</span>
                    }
                </span>
            }</Themed>
        }</ExpanderState.Consumer>
    }

}

export class ExpanderArea extends React.Component<{ eid: ExpanderKey }> {
    render() {
        return <ExpanderState.Consumer>{context =>
            <ExpanderTracking.Consumer>{hierarchy =>
                <ExpanderTracking.Provider value={[ ...hierarchy, this.props.eid ]}>
                    <ExpanderAreaInner expanded={context.data[this.props.eid]}>
                        {this.props.children}
                    </ExpanderAreaInner>
                </ExpanderTracking.Provider>
            }</ExpanderTracking.Consumer>
        }</ExpanderState.Consumer>
    }
}

class ExpanderAreaInner extends React.Component<{ expanded: ExpandState|undefined }> {

    element: HTMLDivElement|null = null

    componentDidUpdate(prevProps: { expanded: ExpandState|undefined }, prevState: {}) {
        if (this.element === null || prevProps.expanded === this.props.expanded) {
            return
        }

        if (this.props.expanded === ExpandState.Expand) {
            window.requestAnimationFrame(() => ensureInView(this.element))
            jQuery(this.element).slideDown()
        }else if (this.props.expanded === ExpandState.ExpandNoAnimation) {
            this.element.style.display = 'block'
        }else{
            jQuery(this.element).slideUp()
        }
    }

    render() {
        return <Themed>{themed =>
            <div style={themed(styles.expanderArea)} ref={e => this.element = e} className="expand-target">
                {this.props.children}
            </div>
        }</Themed>
    }
}

const styles: {[key: string]: ThemedStyle} = {
    expandLink: {
        textDecoration: 'underline',
        cursor: 'pointer',
        color: '#2196F3',

        dark: {
            color: colors.dark.link
        }
    },

    expandedLink: {
        color: '#009688',
        textDecorationStyle: 'dotted'
    },

    expanderArea: {
        display: 'none',
        margin: '1em 0.5em',
        padding: '0.7em',
        borderRadius: '0.4em',
        background: colors.light.background,
        border: '1px solid #dadada',

        dark: {
            background: colors.dark.background,
            border: 'none'
        },

        narrow: {
            margin: 0
        }
    },

    exampleLink: {
        fontSize: '120%',
        display: 'block',
        marginBottom: '0.5em'
    },

    unimportantLink: {
        color: '#304f69',
        textDecoration: 'none',
        borderBottom: '1px dotted #304f69',

        dark: {
            color: 'inherit'
        }
    }
}

function ensureInView(element: HTMLElement|null) {
    if (element === null) return

    const rect = element.getBoundingClientRect()
    if (rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight) {
        zenscroll.to(element, undefined, () => highlight(element))
    }
}

const noEmoji = String.fromCharCode(0xfe0e) + String.fromCharCode(0x00a0)
