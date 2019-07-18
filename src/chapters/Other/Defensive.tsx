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
        <Code language="java" collapsible>{`
        // possible examples:
            android navigation bug
            nullability + collections
            other subtle android bug (view.post, measure or other async shit - first check that it still exists)
            can rely on - view existing in onStart
            need to check - external data
            where checks - separate types for validated vs raw data (non-empty collection, etc.)
            failure modes - crash, data corruption, noop, ui glitch, error message in a less than ideal place (too late in the flow etc.)

        // mixed example:
            definitely something async regarding android lifecycles
            gotta check this on a dummy project

            stateful shit in UI
            stateful shit in backend? (is there much?)
            stateful shit in monitoring daemons

            the video from kotlinconf - issue with checking of state even where guaranteed by other circumstances
            (data always ready *if* this part of UI is visible - enforce/check statically)
        `}</Code>
        <P>
            Consider the following data structure for a UI application where you can record and send messages.
        </P>
        <Code language="kotlin">{`
            sealed class RecordingState
            object NoRecording : RecordingState()
            data class InProgress(val startedAt: Instant) : RecordingState()
            data class Recorded(val data: Media) : RecordingState()
        `}</Code>
        <P>
            Let me ask you a question: which of the following two pieces of code would you prefer to have
            in your project?
        </P>
        <Code language="kotlin">{`
            class RecordingUI {
                
            }
        `}</Code>
        <Code language="kotlin">{`
        `}</Code>
        <P>
            A good example is having UI with asynchronously loaded data. No matter how the program is organized,
            there is a state where the data is ready and a state where it is not. We can display additional
            UI elements, such as buttons, once our data becomes ready.
        </P>
        <Code language="kotlin">{`
            // TODO: classic Android UI example with listeners etc.
            // This is fundamentally a problem of desynchronized state,
            // but this chapter mostly talks about ways of dealing with it,
            // not ways of avoiding it.
            
            // Data is local to the class where it is stateful and nullable
            // Function in the class requires non-null version
            // Instead of performing the check on the stateful data within the function,
            // make it take a non-nullable immutable val as an argument.
            // Same can be said for function requiring a specific subclass, etc.
        `}</Code>
        <Code>{`
            // React Example where data is passed to the section of the UI
            // the section can only exist if the precondition is met
        `}</Code>
        <Code>{`
            // Way to rework Android UI example to avoid this problem.
        `}</Code>
        <P>
            The point here is that we are <strong>separating the part of the code where data is always available from
            the part where it is not</strong>.
        </P>
        <P>
            TODO: example (with object types, no need to check, etc.)
        </P>
        <P>
            Static type systems can help us automate some of these decisions, by providing certain guarantees on one side,
            and enforcing explicit checks on the other. However, they are all limited
            in <LinkTo aid={AnchorKey.Expresiveness}>what kind of facts they can express</LinkTo>.
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
