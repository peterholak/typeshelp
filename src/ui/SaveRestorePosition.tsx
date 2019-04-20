import * as React from 'react'
import { ExpanderMap, ExpanderContext, isExpanded, ExpanderKey, ExpanderState } from './Expander'

interface SavedState {
    expanderState: ExpanderMap
    scrollTop: number
}

const LOCAL_STORAGE_KEY = 'saved-state'

function loadSavedState(): SavedState|undefined {
    try {
        const state = window.localStorage.getItem(LOCAL_STORAGE_KEY)
        if (state === null) {
            return undefined
        }
        return JSON.parse(state)
    }catch(e) {
        return undefined
    }
}

function saveState(state: SavedState|undefined) {
    try {
        if (state === undefined) {
            window.localStorage.removeItem(LOCAL_STORAGE_KEY)
        }else{
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
        }
    }catch(e) {
        // localStorage may be inaccessible on file:// URLs in some browsers...
    }
}

export function clearSavedState() {
    saveState(undefined)
}

interface Props {
    expanderContext: ExpanderContext
}

class SaveRestorePositionInner extends React.Component<Props> {

    componentDidMount() {
        const state = loadSavedState()
        if (state === undefined) {
            return
        }

        const keysToExpand = Object.keys(state.expanderState)
            .map(key => parseInt(key) as ExpanderKey)
            .filter(key => isExpanded(state.expanderState[key]))

        this.props.expanderContext.control.expandImmediately(keysToExpand, () => {
            document.scrollingElement!.scrollTop = state.scrollTop
        })

        // TODO: save on scrolling (debounced)
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.expanderContext.data !== this.props.expanderContext.data) {
            saveState({
                expanderState: this.props.expanderContext.data,
                scrollTop: document.scrollingElement!.scrollTop
            })
        }
    }

    render() {
        return null
    }
}

class SaveRestorePosition extends React.Component {
    render() {
        return <ExpanderState.Consumer>{value =>
            <SaveRestorePositionInner expanderContext={value} />
        }</ExpanderState.Consumer>
    }
}

export default SaveRestorePosition
