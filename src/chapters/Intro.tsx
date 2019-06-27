import * as React from 'react'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import { Theme, withTheme, ThemeData, Themed } from 'Styles'
import { P } from 'ui/Structure'

const Intro = (props: { theme: ThemeData }) => <div style={withTheme(props.theme, { narrow: { margin: '0 0.6em'} })}>
    <h1 style={withTheme(props.theme, titleStyle)}>A Programmer's Type System Glossary</h1>
    {window.location.protocol !== 'file:' && <p>WORK IN PROGRESS (so please don't spread links to this yet)</p>}
    <P>
        With a very <EL eid={EK.Focus}>practical focus</EL>.
        You can leave anonymous feedback by simply selecting any text and choosing
        or writing your opinion about that part. <EL eid={EK.FeedbackSandbox}>Try it out!</EL>
    </P>
    <P>
        I plan on improving and adding content to this document, so check back later. You can switch
        between light/dark themes at the bottom of the page.
    </P>

    <EA eid={EK.Focus}>
        <p>
            I want to describe the terms how people use them in common programming jargon.
            Think more Urban Dictionary than Wikipedia. I also tried to make the text reasonably newbie-friendly,
            and use realistic examples wherever possible.
        </p>
        <p>
            The focus is mainly on <em>practical consequences</em> of popular languages' design choices.
        </p>
        <p>
            If you encounter 
        </p>
        <ul>
            <li>something that's not correct</li>
            <li>something that's difficult to understand without more context</li>
            <li>an example that has a simpler, more obvious solution (<strong>this is especially important</strong>)</li>
            <li>an example that doesn't seem like real code people would actually write (unless it is tiny and quickly followed by another, more realistic example for the same thing)</li>
        </ul>
        <p>
            please take a few seconds to report it.
        </p>
    </EA>

    <EA eid={EK.FeedbackSandbox}>
        Consider this paragraph a feedback sandbox. You can send any random comment about
        any part of the text here and nobody will care. Just select a bit of text and send a comment!
    </EA>
</div>

const titleStyle = {
    dark: { color: '#ddd' }
}

export default Intro
