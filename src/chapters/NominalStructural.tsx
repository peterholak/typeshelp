import * as React from 'react'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import Code from 'ui/Code'
import More from 'chapters/NominalStructural/More'
import { Anchor, AnchorKey as AK } from 'ui/Anchor'
import { P, MainSection } from 'ui/Structure'

const NominalStructural = () => 
    <MainSection>
        <Anchor aid={AK.StructuralNominal} useParent={true}>
        <h2>Nominal typing ↔ Structural typing</h2>
        <P className="subtitle">What determines if a type matches. For example, variables of which types can be used
        as a function argument in the following piece of code.</P>
        <Code>{`
        // TODO: this is very anti-oop in a way that doesn't make sense (a generic turn off function for all kinds of devices/)
            interface Device { address: string }
            function checkConnection(device: Device)
        `}</Code>
        <ul className="summary">
            <li>
                With <strong>nominal</strong> typing, matches are determined
                {' '}<strong>explicitly</strong>—must be the same defined type or an explicitly defined subtype, e.g.
                <Code>{`class Lightbulb implements Device`}</Code>
            </li>
            <li>
                With <strong>structural</strong> typing, matches are determined
                just by the <strong>shape (structure) of the type</strong>, e.g.
                <Code>{`const lightbulb = { address: "192.168.1.20" }`}</Code>
            </li>
        </ul>
        <P>
            This distinction mostly matters in languages with static typing.
        </P>
        <div>
            <EL eid={EK.StructuralNominalExample} example>Example</EL>
            <EA eid={EK.StructuralNominalExample}>
                <P>
                    Nominal typing can be seen in the following bit of Swift code.
                </P>
                <Code language="swift" collapsible>{`
                    struct User { let email: String }

                    func logVisit(user: User) {
                        print("User with email \\(user.email) visited.")
                    }

                    // \`Message\` has the property \`email\` just like \`User\`, but it's a different type.
                    struct Message { let email: String; let contents: String }

                    ✂
                    // This of course works fine.
                    logVisit(user: User(email: "john@example.com"))

                    // This does not.
                    let message = Message(email: "john@example.com", contents: "Hello world.")
                    logVisit(user: 💀message💀1)
                `}{{
                    1: "Cannot convert value of type 🔧Message🔧 to expected argument type 🔧User🔧."
                }}</Code>
                <P>
                    This may seem fairly obvious. Now let's look at TypeScript, a language with
                    a structural type system.
                </P>
                <Code language="typescript" collapsible>{`
                    interface User { email: string }

                    function logVisit(user: User) {
                        console.log(\`User with email \${user.email} visited\`)
                    }

                    ✂

                    // Ok. This is just an object literal with no explicitly specified type.
                    logVisit({ email: "john@example.com" })

                    // Also ok.
                    const message = { email: "john@example.com", contents: "Hello world." }
                    logVisit(message)

                    // Also ok.
                    class Message {
                        constructor(public email: string, public contents: string) {}
                    }
                    const message2 = new Message("john@example.com", "Hello world.")
                    logVisit(message2)

                    // TypeScript doesn't allow extra properties if we're passing in an object literal
                    // (instead of a variable) directly, but that's not important now.
                    logVisit({ email: "john@example.com", 💀contents: "Hello world."💀1 })
                `}{{
                    1: "Object literal only allows known properties, 🔧contents🔧 does not exist on type 🔧User🔧."
                }}</Code>
                <P>
                    TypeScript doesn't care what the concrete type of an object passed to the
                    {' '}<code>logVisit</code> function is—only that it matches the <strong>shape</strong>{' '}
                    that the function's signature says it needs. In this case, it means that it needs to be
                    an object with a string <code>email</code> property.

                    In fact, for many simple types, you don't even need to explicitly give that type a name
                    <Code language="typescript">{`
                        function logVisit(source: { email: string }) {
                            // ...
                        }
                    `}</Code> 
                    This can go as deep as necessary.
                    <Code language="typescript">{`
                        interface Home {
                            rooms: {
                                name: string
                                lightbulbs: Lightbulb[]
                            }[]
                        }

                        // In real code, you would probably want to name the Room type though.
                    `}</Code>
                </P>
                <More />
            </EA>
        </div>
        </Anchor>
        TODO: see also: links to duck, wider/narrower
        TODO: ability to navigate to anchor link (not just anchor itself), very obvious way of handling "back"
        actions and history
    </MainSection>

export default NominalStructural
