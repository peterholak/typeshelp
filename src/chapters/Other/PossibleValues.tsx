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
        When using <LinkTo aid={AnchorKey.StaticDynamic}>static typing</LinkTo>, it tends to be a good idea to use types that can only represent
        the values which are valid within the problem domain. In other words, making invalid states
        not representable at compile-time.
    </P>
    <P>There can however be trade-offs involved, and it <em>is</em> possible to take this principle too far.</P>
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
        {/* adding a new enum value is essentially a BC break unless we explicitly specify how unknown values
        should be handled (in the original version) and make sure that such logic will not fuck things up
        after the enum values are added */}
    </EA>
    <P><EL eid={EK.DesignExampleCombinations} example>Example 2 - combinations of multiple variables</EL></P>
    <EA eid={EK.DesignExampleCombinations}>
        <P>
            Another common situation is when we have a number of separate variables, but 
            only some combinations of them are valid values.
        </P>
        <P>
            Consider the following representation of a UI screen for recording and sending messages.
            You can record a voice message, play it back to yourself, and if you're satisfied with it,
            you can send it to the recipient.
        </P>
        <Code language="kotlin" collapsible={9}>{`
            // TODO: change to go for greater language variability in the article
            // states: idle, recording, recorded, playing
            // playing implies recorded, has same fields, the non-flat hierarchy hints that it's two separate things
            // there is also sending where the rest of the UI is disabled, but again, that is mostly a separate dimension
            class RecordingUI {
                var isRecording = false
                var isPlaying = false
                var message: AudioData? = null
                var hasRecordedMessage = false

                // Assume a primitive UI library with only manual updating.
                fun updateUI() {
                    lengthText.visible = hasRecordedMessage
                    if (hasRecordedMessage) {
                        lengthText.value = message!!.length
                    } else {

                    }
                }

                fun onRecordButtonClicked() {
                    isRecording = true
                    updateUI()
                }

                fun onFinishRecordingClicked() {
                    message = recording
                    hasRecordedMessage = true
                    isRecording = false
                    updateUI()
                }
            }
        `}</Code>
        <P>
            If you look at the <code>var</code>s near the beginning of the class, you may notice
            that not all possible combinations of them are valid states.
        </P>
        <P>
            For starters, the <code>hasRecordedMessage</code> field is redundant and counter-productive.
            Whether we have a recorded message or not is already determined by the combination
            of <code>message</code> being non-null and <code>isRecording</code> being false.
            If we keep <code>hasRecordedMessage</code> as a separate variable and try to adjust its value manually,
            we will sooner or later run into a situation where we screw up somewhere and end up with an invalid combination
            of all the variables.
            Perhaps after adding a new feature during which the data structure will change slightly.
            Because <code>updateUI</code> assumes that <code>hasRecordedMessage</code> being true also
            implies <code>message</code> being non-null, such a desynchronization can easily result
            in a crash of our application.
        </P>
        <P>
            <code>hasRecordedMessage</code> should obviously be a calculated field, to give us a single source of truth. 
            Simple enough:
        </P>
        <Code language="kotlin">{`
            val hasRecordedMessage: Boolean
                get() = message != null && isRecording == false
        `}</Code>
        <P>
            But there are other invalid states still possible in our code.
        </P>
        <P>
            The way our UI works, we cannot record a new message until we have deleted the old one.
            The UI either shows only a "Record" button, or the three "Play", "Delete", "Send" buttons.
            TODO: playing are recording kinda are separate
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
        <P>
            There is still the possibility of having the UI itself getting out of sync with our data, e.g. displaying
            an enabled "Send" button when there is no recording. Such issues can be mostly solved by declarative UI
            libraries such as React, and the many libraries inspired by it.
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
    <P><EL eid={EK.DesignExampleExternalData} example>Example 4 - external data and security</EL></P>
    <EA eid={EK.DesignExampleExternalData}>
        Taints, validation, not very popular, go into reasons why
    </EA>
</div>
