import * as React from 'react'
import * as highlight from 'highlight.js'
import { processTag, escapeHtml } from 'ui/markup'
import { ThemedStyle, mix, Themed, ThemedFunction } from 'Styles'

interface Props {
    language?: string
    displayedLanguage?: string
    collapsible: boolean|number
}

interface State {
    expanded: boolean
}

function fixIndent(html: string) {
    if (html[0] === '\n') {
        html = html.substring(1)
    }
    const firstLineIndent = html.match(/[^ ]/)
    if (firstLineIndent === null) {
        return html
    }
    const result = html.replace(new RegExp(`^ {${firstLineIndent.index}}`, 'gm'), '')
    return result.trim()
}

function isTallText(text: string) {
    return text.trim().match(/.*\n.*\n.*\n.*\n.*\n.*\n/) !== null
}

class Code extends React.Component<Props, State> {

    state = { expanded: false }

    element: HTMLElement|null = null
    references: {[index: number]: string} = {}

    static defaultProps: Partial<Props> = { collapsible: false }

    componentDidMount() {
        if (this.element === null) return
        this.element.innerHTML = fixIndent(this.element.innerHTML)

        const code = this.element.textContent
        if (code !== null && this.props.language !== undefined) {
            this.element.innerHTML = processCode(code, this.references)
            highlight.highlightBlock(this.element)
        }

        // TODO: word wrap with highlight (like react reference docs) responsive (especially useful on mobile)
    }

    render() {
        const displayed = this.props.displayedLanguage || this.props.language || ""
        const code = Array.isArray(this.props.children) ? this.props.children[0] : this.props.children
        const hasExpander = (this.props.collapsible && typeof code === 'string') ? isTallText(code) : false
        const collapsed = hasExpander && !this.state.expanded

        this.references =
            Array.isArray(this.props.children) ? this.props.children[1] || {} : {}

        return <Themed>{ themed =>
            <pre className="hljs">
                <div style={codeWrapperStyle}>
                    <code
                        style={mix({}, [collapsed, collapsedStyle(this.props.collapsible)])}
                        ref={e => this.element = e}
                        className={`lang-${this.props.language}`}
                    >
                        {code}
                    </code>
                    {collapsed && <div style={themed(fadeoutOverlayStyle)} />}
                </div>
                {collapsed && <MoreButton themed={themed} onClick={() => this.setState({ expanded: true })} />}
                <span style={themed(languageStyle)}>{displayed.toUpperCase()}</span>
            </pre>
        }</Themed>
    }

}

function MoreButton(props: { onClick: () => void, themed: ThemedFunction }): JSX.Element {
    return <div style={props.themed(moreButtonStyle)} onClick={props.onClick}>
        <span style={props.themed(moreButtonInnerStyle)}>More</span>
    </div>
}

function referenceTitle(title: string|undefined): string {
    return title === undefined ? '' : `title="${title}"`
}

function processCode(code: string, references: {[index: number]: string}): string {
    code = escapeHtml(code)
    
    code = processTag({
        code,
        open: '💀',
        close: '💀',
        references,
        startTag: (title) => `<span class="squiggly" ${referenceTitle(title)}>`,
        endTag: () => '</span>'
    })

    code = processTag({
        code,
        open: '▶',
        close: '◀',
        references,
        startTag: (title) => `<span class="code-highlight" ${referenceTitle(title)}>`,
        endTag: () => '</span>'
    })

    code = processTag({
        code,
        open: '👉',
        close: '👈',
        references,
        startTag: (title) => `<span data-codetip ${referenceTitle(title)}>`,
        endTag: () => '</span>'
    })

    code = code.replace(/✂/g, '<div class="snip"></div>')

    return code
}

const languageStyle: ThemedStyle = {
    fontSize: '9pt',
    fontFamily: 'sans-serif',
    textTransform: 'uppercase',
    color: '#ccc',
    fontWeight: 600,
    textAlign: 'right',
    display: 'block',
    userSelect: 'none',

    dark: {
        color: '#444'
    }
}

function collapsedStyle(lines: number|boolean = 4): ThemedStyle {
    const height = (typeof lines === 'boolean' ? 4 : lines)
    return {
        maxHeight: `${height}em`,
        overflowY: 'hidden'
    }
}

const codeWrapperStyle: ThemedStyle = {
    position: 'relative',
    overflow: 'hidden'
}

const codeRgb: {[theme: string]: [number, number, number]} = {
    light: [255, 255, 255],
    dark: [35, 35, 40]
}

const moreButtonColor = {
    light: '#999',
    dark: '#666'
}

function rgbaCss(rgb: [number, number, number], alpha: number) {
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`
}

const fadeoutOverlayStyle: ThemedStyle = {
    position: 'absolute',
    background: `linear-gradient(to bottom, ${rgbaCss(codeRgb.light, 0.0)} 0%,${rgbaCss(codeRgb.light, 1.0)} 100%)`,
    bottom: '-0.1em',
    width: '100%',
    height: '2em',
    pointerEvents: 'none',

    dark: {
        background: `linear-gradient(to bottom, ${rgbaCss(codeRgb.dark, 0.0)} 0%,${rgbaCss(codeRgb.dark, 1.0)} 100%)`
    }
}

function zigzag(w: number, h: number, t: number, color: string) {
    const scale = 2, join = 0.05
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" enable-background="new 0 0 ${w} ${h}" height="${h*scale}" width="${w*scale}">
        <g xmlns="http://www.w3.org/2000/svg" fill="${color}">
            <polygon points="0,0 0,${t} ${w/2 + join},${h} ${w/2 + join},${h - t}"/>
            <polygon points="${w/2 - join},${h} ${w/2 - join},${h - t} ${w},0 ${w},${t}"/>
        </g>
    </svg>`
}

const moreButtonStyle: ThemedStyle = {
    textAlign: 'center',
    cursor: 'pointer',
    background: `url(data:image/svg+xml;utf8,${encodeURIComponent(zigzag(12, 4, 0.3, moreButtonColor.light))}) repeat-x center`,

    dark: {
        background: `url(data:image/svg+xml;utf8,${encodeURIComponent(zigzag(12, 4, 0.3, moreButtonColor.dark))}) repeat-x center`,
    }
}

const moreButtonInnerStyle: ThemedStyle = {
    background: rgbaCss(codeRgb.light, 1.0),
    display: 'inline-block',
    padding: '0 0.5em',
    color: moreButtonColor.light,
    userSelect: 'none',

    dark: {
        background: rgbaCss(codeRgb.dark, 1.0),
        color: moreButtonColor.dark
    }
}

export default Code
