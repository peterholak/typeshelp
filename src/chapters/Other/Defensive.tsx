import * as React from 'react'
import { P, ChapterTitle } from 'ui/Structure'
import Code from 'ui/Code'
import { AnchorKey, LinkTo } from 'ui/Anchor'

export default () =>
    <div>
        <ChapterTitle>Defensive programming vs. unwritten assumptions</ChapterTitle>
        <P>
            Programming often involves choosing between a number of less-than-ideal ways to implement things.
            One common group of decisions to make is about:
        </P>
        <ul>
            <li>which assumptions we can just rely on to be true</li>
            <li>which assumptions need to be explicitly checked</li>
            <li>where the checks should go, if there are multiple possiblities</li>
            <li>what happens in case our assumptions turn out to not be true</li>
        </ul>
        <P>
            Static type systems can help us automate some of these decisions, by providing certain guarantees on one side,
            and enforcing explicit checks on the other. However, they are all limited
            in <LinkTo aid={AnchorKey.Expresiveness}>what kind of facts they can express</LinkTo>.
        </P>
        <P>
            TODO: example (with object types, no need to check, etc.)
        </P>
        <P>
            When using a language with dynamic typing, or when we encounter a limitation of a static type system
            (<LinkTo aid={AnchorKey.NullabilityLimitations}>example</LinkTo>), we often have to choose between
        </P>
        <ul>
            <li>
                relying on things that are not explicitly written in the code,
                but are only implied by the structure of the program
                <Code>{`
                `}</Code>
            </li>
            <li>
                checking for things that we never expect to occur, where many of them can't possibly
                occur in the present version of the program
                <Code>{`
                `}</Code>
            </li>
        </ul>
        {/* TODO: the more local the assumptions are, the less of a big deal it is */}
    </div>
