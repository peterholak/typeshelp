import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as e from 'ui/Expander'
import { BackPopup, BackDirection, AnchorState as AnchorContext, AnchorMap, AnchorKey, LinkClickState, Size } from 'ui/Anchor'
import Intro from 'chapters/Intro'
import Other from 'chapters/Other'
import StaticDynamic from 'chapters/StaticDynamic'
import StrongWeak from 'chapters/StrongWeak'
import NominalStructural from 'chapters/NominalStructural'
import Tooltips from 'ui/tooltip'
import { ThemeContext, Theme, loadTheme, saveTheme, withTheme, applyThemeToDom, ThemedStyle, ThemeData, shouldUseNarrowStyle } from 'Styles'
import SelectionPopup from 'ui/SelectionPopup'
import CommentControls, { CommentOverlay, CommentNetworkHandler } from 'ui/CommentControls'
import { CommentType, CommentNetworkClient } from 'network/CommentClient'
import SaveRestorePosition, { clearSavedState } from 'ui/SaveRestorePosition'
import colors from 'colors'
import highlight from 'ui/highlight'
import * as zenscroll from 'zenscroll'
import { ChapterContext } from 'ui/ChapterCounter'

const containerStyle: ThemedStyle = {
    background: colors.light.background,
    padding: '20px',
    marginTop: '10px',

    dark: {
        background: colors.dark.background
    },
    
    narrow: {
        padding: 0
    }
}

const footerStyle: ThemedStyle = {
    color: '#000',
    dark: {
        color: '#fff'
    }
}

const bodyFontSize = parseInt(getComputedStyle(document.body).fontSize || "0") || 0

type BackPopupState = { visible: boolean, direction?: BackDirection }

interface State {
    theme: ThemeData
    errors?: any
    overlayVisible: boolean
    overlayRequestedType: CommentType|undefined
    storedSelection: string
    selectionPointerType: string|undefined
    backPopup: BackPopupState
}

class App extends React.Component<{}, State> {

    state: State = {
        theme: { theme: loadTheme(), narrow: false },
        overlayVisible: false,
        overlayRequestedType: undefined,
        storedSelection: '',
        selectionPointerType: undefined,
        backPopup: { visible: false }
    }

    container: HTMLDivElement|null = null
    tooltips: Tooltips|undefined
    expanders: e.ExpanderProvider|null = null

    commentClient = new CommentNetworkClient(
        window.location.protocol === 'file:' ?
            'http://localhost:8080' :
            window.location.origin
    )

    anchorMap: AnchorMap = {}

    linkHistoryState: LinkClickState|undefined
    scrollInProgress: boolean = false
    backPopupSize: Size = { width: 0, height: 0 }

    componentDidCatch(errors: any, info: any) {
        this.setState({ errors: [errors, info] })
    }

    componentDidMount() {
        this.tooltips = new Tooltips('[title]')
        applyThemeToDom(this.state.theme.theme)

        window.addEventListener('resize', this.onWindowResized)
        this.onWindowResized()
        window.addEventListener('popstate', this.onHistoryBack)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResized)
        window.removeEventListener('popstate', this.onHistoryBack)
    }

    onWindowResized = () => {
        const newNarrow = shouldUseNarrowStyle()
        if (newNarrow !== this.state.theme.narrow) {
            this.setState({ theme: { ...this.state.theme, narrow: newNarrow } })
        }
    }

    componentDidUpdate(_: {}, prevState: State) {
        if (this.state.overlayVisible && !prevState.overlayVisible && this.tooltips) {
            this.tooltips.hideTooltip()
            
            // This hides the "copy/paste/..." UI on mobile browsers
            const selection = window.getSelection()
            if (selection !== null) {
                selection.removeAllRanges()
            }
        }
    }

    renderError(error: any): string {
        if (error instanceof Error) {
            return error.stack || error.toString()
        }
        return JSON.stringify(error, null, 4).replace(/\\n/g, '\n')
    }

    render() {
        if (this.state.errors !== undefined) {
            const errorList = Array.isArray(this.state.errors) ? this.state.errors : [this.state.errors]
            return <div>
                <h2>An error has occurred</h2>
                {errorList.map(e => <pre>{this.renderError(e)}</pre>)}
            </div>
        }

        const themed = (style: ThemedStyle) => withTheme(this.state.theme, style)

        return <e.ExpanderProvider ref={e => this.expanders = e}>
            <ThemeContext.Provider value={this.state.theme}>
            <ChapterContext.Provider value={{ nextChapter: 1 }}>
            <AnchorContext.Provider value={{ map: this.anchorMap, navigateToAnchor: this.navigateToAnchor }}>
                <SaveRestorePosition />
                <SelectionPopup overlayVisible={true} onPointerTypeDetermined={this.setSelectionPointerType}>
                    <CommentControls
                        showOverlay={this.requestShowOverlay}
                        theme={this.state.theme}
                        pointerType={this.state.selectionPointerType}
                        />
                </SelectionPopup>
                
                {this.state.overlayVisible &&
                <CommentNetworkHandler commentClient={this.commentClient}>{ (requestState, sendComment) =>
                    <CommentOverlay
                        storedSelection={this.state.storedSelection}
                        initialCommentType={this.state.overlayRequestedType}
                        onHide={this.requestHideOverlay}
                        onSendComment={sendComment}
                        requestState={requestState}
                        />
                }</CommentNetworkHandler>}

                <BackPopup
                    themed={themed}
                    visible={this.state.backPopup.visible}
                    direction={this.state.backPopup.direction}
                    onHide={this.requestHideBackPopup}
                    onBack={this.requestBack}
                    onMeasured={this.backPopupMeasured}
                    />

                <div style={themed(containerStyle)} ref={e => this.container = e}>
                    <Intro theme={this.state.theme} />
                    <StaticDynamic /> 
                    <StrongWeak />
                    <NominalStructural />
                    <Other />
                </div>

                <footer style={themed(footerStyle)}>
                    <a style={themed(footerStyle)} href="https://creativecommons.org/licenses/by-sa/4.0/">CC-BY-SA</a> | {' '}
                    <a style={themed(footerStyle)} id="expand-all" href="#" onClick={this.expandAll}>Expand all</a> | {' '}
                    <a style={themed(footerStyle)} href="#" onClick={this.toggleTheme}>Theme</a> | {' '}
                    <a style={themed(footerStyle)} href="#" onClick={this.clearExpandScrollState}>Reset</a> | {' '}
                    <a style={themed(footerStyle)} href="https://github.com/peterholak/typeshelp">Github</a> | {' '}
                    <a style={themed(footerStyle)} href="https://www.holak.net/">peter@holak.net</a>
                </footer>
                
            </AnchorContext.Provider>
            </ChapterContext.Provider>
            </ThemeContext.Provider>
        </e.ExpanderProvider>
    }

    expandAll = (e: React.MouseEvent) => {
        e.preventDefault()
        if (this.expanders) {
            this.expanders.expandAll()
            // TODO: also all collapsed code blocks with the more button
            this.container && this.container.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    toggleTheme = (e: React.MouseEvent) => {
        e.preventDefault()
        const newTheme = { ...this.state.theme, ...{ theme: this.state.theme.theme === Theme.Light ? Theme.Dark : Theme.Light } }
        this.setState({ theme: newTheme })
        applyThemeToDom(newTheme.theme)
        saveTheme(newTheme.theme)
    }

    requestShowOverlay = (type: CommentType|undefined) => {
        this.setState({
            overlayVisible: true,
            overlayRequestedType: type,
            storedSelection: (window.getSelection() || '').toString()
        })
    }

    requestHideOverlay = () => {
        this.setState({ overlayVisible: false })
    }

    setSelectionPointerType = (pointerType: string) => {
        this.setState({ selectionPointerType: pointerType })
    }

    clearExpandScrollState = () => {
        clearSavedState()
        window.location.reload()
    }

    requestHideBackPopup = () => {
        this.linkHistoryState = undefined
        this.setState({ backPopup: { visible: false } })
    }

    requestBack = () => {
        if (!this.scrollInProgress) {
            history.back()
        }
    }

    onHistoryBack = (_: PopStateEvent) => {
        if (this.linkHistoryState === undefined) {
            return
        }
        this.scrollInProgress = true
        zenscroll.toY(this.linkHistoryState.documentScroll, undefined, () => {
            this.linkHistoryState = undefined
            this.scrollInProgress = false
            this.setState({ backPopup: { visible: false } })
        })
    }

    // TODO: might be more robust to not store the scroll position as number, but instead insert an anchor
    // DOM node at the top scroll position, so that it gets restored correctly even if the window gets
    // resized in the meantime.
    navigateToAnchor = (key: AnchorKey) => {
        const anchor = this.anchorMap[key]
        if (anchor === undefined || anchor.element === null) return

        this.expanders!.expandImmediately(
            anchor.expanderHierarchy,
            () => {
                if (anchor.element === null) return

                const targetElement = (anchor.useParent ? anchor.element.parentElement : anchor.element)
                if (targetElement === null) return

                const direction = (targetElement.offsetTop > document.scrollingElement!.scrollTop)
                    ? BackDirection.Above : BackDirection.Below

                this.linkHistoryState = { documentScroll: document.scrollingElement!.scrollTop }

                const tooNarrowForButton =
                    document.body.getBoundingClientRect().left < this.backPopupSize.width + BackPopup.minLeftOffset

                const targetTop = zenscroll.getTopOf(targetElement) -
                    (tooNarrowForButton ? this.backPopupSize.height + bodyFontSize * 1.5 : 0)

                zenscroll.toY(targetTop, undefined, () => {
                    highlight(targetElement)
                    history.pushState(key, AnchorKey[key], `#${AnchorKey[key]}`)
                    this.setState({ backPopup: { visible: true, direction: direction } })
                    // TODO: don't break wheel click, open new tab to particular position
                })
            }
        )
    }

    backPopupMeasured = (size: Size) => {
        this.backPopupSize = size
    }
}

ReactDOM.render(<App />, document.getElementById('app'))
