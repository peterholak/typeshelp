import * as React from 'react'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import Code from 'ui/Code'
import { P, MainSection, PersonalOpinion } from 'ui/Structure'
import { LinkTo, AnchorKey } from 'ui/Anchor';

const StrongWeak = () =>
    <MainSection>
        <h2>Strong typing ↔ Weak typing</h2>
        <P className="subtitle">
            These are poorly defined terms, with many people disagreeing on what exactly they mean. It usually
            has to do with a degree of <em>strictness</em>, with strong typing being regarded as more strict.
        </P>
        <ul className="summary">
            <li>
                In languages with <strong>stronger</strong> typing, a type mismatch will typically result in an <strong>error</strong>.
            </li>
            <li>
                With <strong>weaker</strong> typing, a mismatch will often result in a <strong>conversion/coercion</strong>.
            </li>
        </ul>
        <P>
            This one is also more of a spectrum than a clear distinction.
        </P>
        <P>
            <EL eid={EK.StrongWeakExample} example>Example</EL>
        </P>
        <EA eid={EK.StrongWeakExample}>
            <P>
                Languages have many different features that can be thought of as making them "stronger" or "weaker".
            </P>
            <P>
                An example of weak typing is the way <code>undefined</code> works on objects and function arguments in JavaScript.
                <Code language="javascript">{`
                    class Light {
                        constructor() {
                            this.brightness = 0
                        }
                    }
                    const light = new Light()

                    // \`Light\` doesn't have a \`color\` property.
                    // No error here, \`color\` will simply have the value \`undefined\`.
                    const color = light.color

                    // This will print \`undefined\`.
                    console.log(color)

                    // Only at this line will an error be thrown (it tries to access \`undefined.red\`).
                    console.log(color.red)
                `}</Code>
                <P>Compare this to Python</P>
                <Code language="python">{`
                    class Light:
                        def __init__(self):
                            self.brightness = 0

                    light = Light()

                    # This throws an error.
                    color = light.color
                `}</Code>
            </P>
            <P>
                Then there is the classic example of the plus operator, and adding string to a number, shown here with JavaScript and Ruby.
                <Code language="javascript">{`
                    // Prints "12".
                    console.log(1 + "2")
                `}</Code>
                <Code language="ruby">{`
                    # Causes an error.
                    puts(1 + "2")
                `}</Code>
            </P>
            <P>
                Obviously noone is going to be literally writing <code>1 + "2"</code> in their code, but
                there are situations where a type of some variable may not be what
                you <EL eid={EK.Mistakes} unimportant>might expect</EL>.
            </P>
            <EA eid={EK.Mistakes}>
                <P>
                    People also make mistakes even when they <em>do</em> know the correct answer,
                    when they're in a hurry, not fully focused, or for a million other reasons.
                </P>
                <PersonalOpinion>
                    <P>
                        One of my pet peeves is when people correct someone's incorrect use
                        of the words <code>their</code>/<code>there</code>/<code>they're</code> in a way
                        where they blame it on the author's bad knowledge of grammar.
                    </P>
                    <P>
                        I'm pretty sure that basically everyone who ever made such a mistake is fully
                        aware of what all of these words mean. They most likely mistyped the word
                        because of not paying attention and their brain just automatically picked
                        a word based on its sound. Hell, I even once typed the word <code>they</code> instead
                        of <code>day</code> when I was doing two things at the same time, just because it sounds the same (kind of).
                    </P>
                    <P>
                        Blaming this on not knowing grammar is the dumbest shit ever, regardless of whether people are
                        doing it sincerely or not.
                    </P>
                </PersonalOpinion>
            </EA>
            <Code language="javascript">{`
                // If you're familiar with CSS, but not so much with DOM specifics,
                // it intuitively makes sense for \`flexGrow\` to be a number here.
                const thisGrow = getComputedStyle(element).flexGrow
                const nextGrow = 1 + thisGrow

                // However, it is actually not a number, but a string such as "1"
                // (just like all CSS values in DOM), so \`nextGrow\` would end up
                // being the string "11".
            `}</Code>
            <P>
                Getting an error can help avoid a situation where you combine data (variables)
                from different parts of the codebase, then you save the results, and then wonder two months
                later "why is there a 12 in my database?".
            </P>
            <P>
                In some programs, the problem may only occur in a specific branch, or with specific kind of data,
                making the cause difficult to track down.
            </P>
            <P>
                Stricter run-time checks follow the philosophy that it is <strong>better to make an operation fail,
                rather than proceeding with possibly corrupted data</strong>. They also aim to increase the likelihood that an error
                will manifest itself close to the point <LinkTo aid={AnchorKey.ErrorCloseToRootCause}>where the root of the problem is</LinkTo>,
                instead of at a later time in a different place.
            </P>
            <P>
                On the other hand, such checks can also make the program fail in harmless, "false positive" situations.
                You probably wouldn't want your program to crash in production just because a low‑level log message
                couldn't be constructed (even though it's an issue that obviously should be fixed).
            </P>
            <P>
                People often confuse the term strong typing with static typing. While strong typing implies somewhat strict
                run-time checks (e.g. a crash in a situation where a function is called with the wrong arguments),
                it won't prevent the situation from ocurring in the first place—the code will still compile and run until
                it <LinkTo aid={AnchorKey.WholeProgram}>reaches that branch</LinkTo>. It's more of an early warning system.
            </P>
        </EA>
    </MainSection>

export default StrongWeak
