import * as React from 'react'
import { Themed, ThemedStyle } from 'Styles'
import colors from 'colors'
import { AnchorKey, LinkTo } from './Anchor'
import { ChapterContext } from './ChapterCounter';

export const TopicsWithoutHeaders = () => {}

export const Topic = () => {}

// Temporary fix for "this can't be descendant of <p>", to not lose the semantic meaning
// that I would've lost if I just put divs everywhere directly. Once the final structure
// is in place, this will no longer be necessary.
export const P = (props: { className?: string, children?: React.ReactNode }) =>
    <div className={[props.className, 'p'].join(' ')}>{props.children}</div>

export const SummaryNavigation = (props: React.Props<{}>) =>
    <ul style={summaryNavigationStyle}>
        {props.children}
    </ul>

export const NavLink = (props: React.Props<{}> & { aid: AnchorKey }) =>
    <li style={navLinkStyle}><LinkTo aid={props.aid}>{props.children}</LinkTo></li>

export const ExternalLink = (props: React.Props<{}> & { href: string }) =>
    <Themed>{ themed =>
        <a style={themed(externalLinkStyle)} href={props.href} target="_blank">{props.children} {'🔗\ufe0e'}</a>
    }</Themed>

export const PersonalOpinion = (props: React.Props<{}>) =>
    <Themed>{(themed) =>
        <div className="p" style={themed(personalOpinionStyle)}>
            <div style={themed(personalOpinionTextStyle)}>Personal opinion</div>
            {props.children}
        </div>
    }</Themed>

export class ChapterTitle extends React.Component {
    render() {
        return <ChapterContext.Consumer>{value =>
            <h2>{value.nextChapter++}. {this.props.children}</h2>
        }</ChapterContext.Consumer>
    }
}

const personalOpinionStyle: ThemedStyle = {
    border: '1px dotted #ccc',
    padding: '2px'
}

const personalOpinionTextStyle: ThemedStyle = {
    textTransform: 'uppercase',
    fontSize: '75%',
    textAlign: 'right',
    color: '#aaa',
    paddingRight: '0.5em',
    paddingTop: '0.5em',
    userSelect: 'none',
    dark: {
        color: '#aaa'
    }
}

export const MainSection = (props: React.Props<{}>) =>
    <Themed>{themed =>
        <section style={themed(mainSectionStyle)}>{props.children}</section>
    }</Themed>

const mainSectionStyle: ThemedStyle = {
    marginTop: '1em',
    marginBottom: '1em',
    borderRadius: '0.6em',
    background: colors.light.mainSectionBackground,

    dark: {
        background: colors.dark.mainSectionBackground
    },

    narrow: {
        marginLeft: 0,
        marginRight: 0
    }
}

const navLinkStyle: React.CSSProperties = {
    marginTop: 0,
    marginBottom: '0.2em'
}

const summaryNavigationStyle: React.CSSProperties = {
    marginTop: '0.25em',
    marginBottom: '1em'
}

const externalLinkStyle: ThemedStyle = {
    color: colors.light.link,
    textDecorationStyle: 'dotted',

    dark: {
        color: colors.dark.link
    }
}
