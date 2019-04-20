import * as React from 'react'
import { P, ChapterTitle } from 'ui/Structure'
import { ExpanderLink as EL, ExpanderArea as EA, ExpanderKey as EK } from 'ui/Expander'
import Code from 'ui/Code'
import { LinkTo, AnchorKey, Anchor } from 'ui/Anchor'

export default () => <div>
    <ChapterTitle>The set of possible values</ChapterTitle>
    <P>
        One way of thinking about a type is as the set of all the possible values it can represent.
    </P>
    <P>
        The number of values in the set—its cardinality—is a related (but different) issue as wider/narrower types.
        Some examples:
    </P>
    <ul>
        <li>a <code>Boolean</code> can hold 2 - <code>true</code> / <code>false</code></li>
        <li>a <code>Maybe&lt;Boolean&gt;</code> can hold 3 - <code>Some(true)</code> / <code>Some(false)</code> / <code>None</code></li>
        <li>the same in Kotlin would be expressed as a nullable <code>Boolean?</code> - with possible values <code>true</code> / <code>false</code> / <code>null</code></li>
        <li>an unsigned <code>byte</code> can hold any number from 0 to 255 - that is 256 different values</li>
        <li>a <code>{'pair<bool, byte>'}</code> can hold 512 - <code>true</code> with 0 to 255, and <code>false</code> with 0 to 255.</li>
        <li>a <code>string</code> can hold any text - an infinite number of possibilities</li>
    </ul>
    <h3>Software design and types</h3>
    <P>
        When using <LinkTo aid={AnchorKey.StaticDynamic}>static typing</LinkTo>, one of the goals of good code design is to use types that can only represent
        the values which are valid within the problem domain. In other words, making invalid states
        not representable at compile-time.
    </P>
    <P><EL eid={EK.DesignExampleEnum} example>Example 1 - strings and enums</EL> TODO: use scala to have more language variety in examples?</P>
    <EA eid={EK.DesignExampleEnum}>
        <Code language="kotlin">{`
            // Bad: a String can contain anything, but our program can only work with
            // exactly these 4 values.
            fun nextState(state: String, score: Int): String = when (state) {
                "idle" -> "started"
                "started" -> if (score <= 50) "started" else "completing"
                else -> "ended"
            }

            ✂
            // Better: an enum can only represent the specified set of values
            enum class State { Idle, Started, Completing, Ended }

            fun nextState(state: State, score: Int): State = when (state) {
                State.Idle -> State.Started
                State.Started -> if (score <= 50) State.Started else State.Completing
                State.Completing -> State.Ended
                // Notice how we don't need an \`else\` branch here, because we have already
                // covered all the possibilies.
            }
        `}</Code>
        <P>
            This has a number of benefits:
            <ul>
                <li>Guards against accidental typos.</li>
                <li>Provides a specification—we don't need to search through the documentation (or worse, dig through the code)
                    to find out what the possible values are. Our type already contains all the information we need—especially if we add
                    documentation comments (e.g. javadoc) to every possible value in the enum.</li>
                <li>If we later refactor the code to add a new state (e.g. <code>Initializing</code>), the compiler will
                    automatically notify us that our <code>nextState</code> function doesn't handle this new case -
                    our code will not compile and the error will be pointed out to us. The same will happen
                    if we remove one of the possible states from the enum.</li>
                <li>Running "find usages" on the type <code>State</code>, or one of its values, will
                    only give us real usages of exactly what we request. In contrast, a simple full-text search
                    may return a number of unrelated results, which just happen to contain the same words (such as "started").</li>
            </ul>
        </P>
        <P>
            For representing internal structures of the application, this is pretty much a no-brainer.
            However, when communicating such data with other systems, there are additional considerations that need to be made.
        </P>
        <P>
            Imagine an external API which returns to us a JSON string representing a state, which we then covert into our enum values.
            If there is a possibility that the server may add a new state that we don't know about in a new version, we would be giving up
            forward comaptibility.
        </P>
        <P>
            Assuming we don't want to reject such responses outright (which may be a suitable course of action),
            we could deal with this by adding a new <code>Unknown</code> value to our enum, or using
            a nullable type <code>State?</code> and representng unknown states as <code>null</code>.
        </P>
        <P>
            Either way, after adapting our type like this, we will have to modify our code to deal with the possibility
            of unknown states, returned by future versions of the server. We are making an explicit choice about how we handle
            unknown states at every step of the program.
        </P>
        <Code language="kotlin">{`
            // We convert known states into our enum values, and unknown states into \`null\`.
            fun stateFromServer(): State? { /* ... */ }

            // This function will not accept nullable \`State?\` values - we need to
            // handle them outside of it. The function's code can stay the same.
            // We can have whole sections of our application that only deal with known states.
            fun nextState(state: State, score: Int): State { /* ... */ }

            ✂
            players.forEach { player ->
                if (player.state != null) {
                    player.state = nextState(player.state, player.score)
                }
                // We make a choice here to do nothing with players in an unknown state.
            }

            ✂
            // This function supports unknown states. We make a choice here to display
            // them in our program as "unsupported".
            fun displayState(state: State?) { /* ... */ }
        `}</Code>
        <P>
            This way we preserve most of the benefits mentioned above, while maintaining a degree of forward compatibility
            with new versions of the server—an older version of our application won't be able to fully process the new cases,
            but it also won't just stop working completely. (TODO: this may not be the best example because the domain
            logic could actually be wrong. come up with one that is clearly correct even in the unknown case)
        </P>
        <P>
            There is still zero risk of forgetting to handle the unknown case in relevant places - the compiler won't
            let us do that (e.g it won't let us pass a nullable <code>State?</code> to a function that only deals with
            known non-null <code>State</code> values).
        </P>
        <P>
            It is worth noting that keeping the representation of states as strings (instead of using an enum) would not
            absolve us of the responsibility to handle unknown states either—it would not magically make our
            code forward compatible.
        </P>
        <P>
            While we could just keep our JSON deserialization unchanged, how other parts
            of the code deal with such situations wouldn't be obvious - sometimes it would be a no-op,
            other times it might crash, or produce an unexpected value. And in a few cases, it might happen to work
            without extra effort (e.g. when just displaying the state as string).
        </P>
    </EA>
    <P><EL eid={EK.DesignExampleCombinations} example>Example 2 - combinations of multiple variables</EL></P>
    <EA eid={EK.DesignExampleCombinations}>
        <P>
            Another common situation is when we have a number of separate variables, but 
            only some combinations of them are valid values.
        </P>
        <Code language="typescript">{`
            // Bad: the properties \`resolution\` and \`fps\` don't make sense for audio clips,
            // and \`duration\` doesn't make sense for pictures.
            interface Media {
                kind: 'video'|'picture'|'audio'
                resolution: Size
                fps: number
                duration: number
            }

            function textInformation(media: Media) {
                // We have to make sure at every step that we don't access a property
                // that doesn't make sense in the situation (or the value will be garbage,
                // we might get unexpected behavior, etc.)
                return \`Resolution: \${media.resolution.toString()} ...\`
            }

            ✂
            // Good: every type only has properties that are valid for it.
            // (In a language with nominal typing, this would be achieved using interfaces.)
            interface Video {
                kind: 'video'
                resolution: Size
                duration: number
                fps: number
            }

            interface Picture {
                kind: 'picture'
                resolution: Size
            }

            interface Audio {
                kind: 'audio'
                duration: number
            }

            type Media = Video|Picture|Audio

            function textInformation(media: Media) {
                // The compiler won't let us access a property that might not be there.
                return \`Resolution: \${media.💀resolution💀.toString()} ...\`
            }

            ✂
            function textInformation(media: Media) {
                // We can still access \`media.kind\` that exists on all media types,
                // but are forced to check for the other ones.
                if (media.kind == 'video' || media.kind == 'picture') {
                    return \`Resolution: \${media.resolution.toString()} ...\`
                }
                // ...
            }

            // We can also make functions that only work for pictures and videos
            function generateThumbnail(media: Picture|Video) {
                // ...
            }
        `}</Code>
        <P>(TODO: more oop way might be adding generateThumbnail directly onto the interfaces, but that would
            then violate SRP, and we couldn't have pluggable thumbnail generators. Also we are kinda relying on specific
            implementations here, but good enough.)
            (TODO: in general this is a pretty bad example, because it is showcasing different kinds of things,
            which are then trivially separated into proper subtypes. a better example would be showcasing things
            that exists in certain states, the error/ok situation, or I dunno, something better...)
        </P>
        <P>
            Usually this representation requires a language that can express sum types (TODO link).
            If the language can't express this, we are essentially "falling back" (TODO link) to dynamic typing,
            where we have an unwritten implicit assumption.
        </P>
        <P>
            Another situation everyone comes across is when we want to express "result <strong>or</strong> error",
            instead of having two separate variables "result <strong>and</strong> error", where it doesn't make sense
            for both to contain valid values at the same time.
        </P>
    </EA>
    <P><EL eid={EK.DesignExampleInitialization} example>Example 3 - initialization and other state</EL></P>
    <EA eid={EK.DesignExampleInitialization}>
        <Anchor aid={AnchorKey.Initialization} useParent>
        <P>
            For any application that deals with a lot of mutable state—this includes most
            desktop/mobile/web frontend applications—a lot of the bugs are a result of doing something
            in an inappropriate state.
        </P>
        <P>
            A common example is trying to work with an object that has not been initialized yet.
        </P>
        <Code>{`
            // TODO: an example with an async init (e.g. GoogleMap) + another async operation completing before the init and
            // having its handler assuming that the first operation is completed already
            // TODO: or a possible deinit happening in between
        `}</Code>
        </Anchor>
    </EA>
</div>
