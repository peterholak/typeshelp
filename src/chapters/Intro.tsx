import * as React from 'react'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import { Theme, withTheme, ThemeData, Themed } from 'Styles'
import { P } from 'ui/Structure'

const Intro = (props: { theme: ThemeData }) => <div style={withTheme(props.theme, { narrow: { margin: '0 0.6em'} })}>
    <h1 style={withTheme(props.theme, titleStyle)}>A Programmer's Type System Overview</h1>
    {window.location.protocol !== 'file:' && <p>WORK IN PROGRESS (so please don't spread links to this yet)</p>}
    <P>
        You can leave anonymous feedback by simply <em>selecting any text</em> and choosing
        or writing your opinion about that part. <EL eid={EK.FeedbackSandbox}>Try it out!</EL> You can also
        switch the <a href="#todo">theme</a>.
    </P>
    <EA eid={EK.FeedbackSandbox}>
        <p>
            Consider this paragraph a feedback sandbox. You can send any random comment about
            any part of the text here and nobody will care. <strong>Just select a bit of text and send
            a comment!</strong> You don't even have to write anything!
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
            <li>a section that is so long/difficult/convoluted/boring that you gave up on reading it</li>
        </ul>
        <p>
            please take a few seconds to report it.

            TODO: when there is a long run of paragraphs that gets too boring, break that shit up with code examples.
            more code examples in general (but good example of course), less bullshit text (only good text)
        </p>
        <p>
            Most of this stuff is based on my experience, all the countless online discussions I've participated in over the years,
            bug report/feature request discussions and a few of my opinions, so <em>don't consider it an authoritative source</em>.
            I want to describe terms in the way that people really use them in common programming jargon.
        </p>
        <p>
            I plan on improving and adding content to this document (maybe even some exercises), so check back later.
        </p>
    </EA>
</div>

const titleStyle = {
    dark: { color: '#ddd' }
}

export default Intro
