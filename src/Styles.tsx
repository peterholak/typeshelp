import * as React from 'react'
import colors from 'colors';

export enum Theme { Light, Dark }

export interface ThemeData { theme: Theme, narrow: boolean }

export const ThemeContext = React.createContext<ThemeData>({ theme: Theme.Light, narrow: false })

export type ThemedStyle = React.CSSProperties & { dark?: React.CSSProperties, narrow?: React.CSSProperties }

export function shouldUseNarrowStyle() {
    return window.innerWidth < 900
}

export function withTheme(theme: ThemeData, style: ThemedStyle): React.CSSProperties {
    const dark = theme.theme === Theme.Dark ? style.dark : {}
    const narrow = theme.narrow ? style.narrow : {}
    const result = { ...style, ...dark, ...narrow }
    delete result['dark']
    delete result['narrow']
    return result
}

export type ThemedFunction = (style: ThemedStyle) => React.CSSProperties
type MixThemedFunction = (style: ThemedStyle, ...args: [boolean|undefined, ThemedStyle][]) => React.CSSProperties

export const Themed = (props: { children: (themed: ThemedFunction, mixThemed: MixThemedFunction, theme: ThemeData) => React.ReactNode }) =>
    <ThemeContext.Consumer>{theme =>
        props.children(
            style => withTheme(theme, style),
            (style, ...args) => mixWithTheme(theme, style, ...args),
            theme
        )
    }</ThemeContext.Consumer>

export function loadTheme() {
    try {
        return window.localStorage.getItem('theme') === 'dark' ? Theme.Dark : Theme.Light
    }catch(e) {
        // Edge doesn't let you use `localStorage` on a `file://` address...
        return Theme.Light
    }
}

export function saveTheme(theme: Theme) {
    window.localStorage.setItem('theme', theme === Theme.Dark ? 'dark' : 'light')
}

export function applyThemeToDom(theme: Theme) {
    document.body.classList.toggle('dark', theme === Theme.Dark)
    document.body.style.background = (theme === Theme.Dark ? colors.dark.background : colors.light.background)
    const code = document.getElementById('code-stylesheet')
    if (code === null) return
    code.setAttribute('href', `static/highlightjs-${theme === Theme.Dark ? 'gruvbox-dark' : 'github-gist'}.css`)
}

export function mix(base: React.CSSProperties, ...args: [boolean|undefined, React.CSSProperties][]): React.CSSProperties {
    let result = base
    args.forEach(pair => {
        if (pair[0]) result = { ...result, ...pair[1] }
    })
    return result
}

export function mixWithTheme(
    theme: ThemeData,
    base: ThemedStyle,
    ...args: [boolean|undefined, ThemedStyle][]
): React.CSSProperties {
    let result = withTheme(theme, base)
    args.forEach(pair => {
        if (pair[0]) result = { ...result, ...withTheme(theme, pair[1]) }
    })
    return result
}

export function themedColor(themeData: Theme|ThemeData, colors: { dark: string, light: string }) {
    const theme = themeData.hasOwnProperty('theme') ? (themeData as ThemeData).theme : themeData
    return theme === Theme.Dark ? colors.dark : colors.light
}
