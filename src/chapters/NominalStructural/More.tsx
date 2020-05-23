import * as React from 'react'
import { ExpanderLink as EL, ExpanderArea as EA, ExpanderKey as EK } from 'ui/Expander'
import Code from 'ui/Code'
import { LinkTo, AnchorKey as AK, AnchorKey } from 'ui/Anchor'
import { P, PersonalOpinion } from 'ui/Structure'

export default () => <div>
    <EL eid={EK.StructuralNominalMore}>More...</EL>
    <EA eid={EK.StructuralNominalMore}>
        <P>
            Back to the previous example, if we wanted the Swift <code>logVisit</code> function
            to also work with <code>Message</code>s, we would have to explicitly
            make both of these types conform to a protocol (in other languages "implementing an interface" refers to the same thing).
        </P>

        <Code language="swift">{`
            protocol HasEmail { var email: String { get } }

            struct User: HasEmail { let email: String }

            struct Message: HasEmail { let email: String; let contents: String }

            func logVisit(source: HasEmail) {
                // ...
            }
        `}</Code>

        <P>That pretty much captures most of the pros and cons of these approaches.</P>

        <ul>
            <li>
                With nominal typing, you may sometimes have to create an inheritance hierarchy
                just to satisfy the compiler. With structural typing, you just specify
                which properties and functions you need.
            </li>
            <li>
                With structural typing, there is a possibility of passing in the
                wrong type which happens to match the shape unintentionally (especially
                if working with someone else's code). This won't happen with nominal typing.
                There also needs to be some way to express completely <LinkTo aid={AnchorKey.Opaque}>opaque types</LinkTo> in
                a structurally typed language.
            </li>
            {/* TODO: maybe also a more complex inheritance hierarchy example (but realistic) */}
        </ul>

        <PersonalOpinion>
            <P>
                Personally, I find both of the concerns somewhat overblown. I have never
                come across a problem caused by an unintended structural match, nor have
                I had much trouble modelling a domain by using classes and interfaces.
            </P>
            <P>
                Structural typing can make things such as code generation (e.g. from a SQL schema) easier, because common
                subsets of fields such as <code>(id, name)</code> can be directly used, instead of
                the generator having to extract them into interfaces that the other generated classes
                then implement. Or not extracting them, and then not having a common usable supertype at all—sometimes
                it is not necessary.
            </P>
        </PersonalOpinion>
        <P>
            {/* this section drifts a bit far from the topic, maybe split into separate file */}
            The <LinkTo aid={AK.Expresiveness}>expressiveness</LinkTo> of structural typing
            can be easily enhanced by other language features. Specifically TypeScript
            has many features that allow you to mix and match, bend and shape the types
            in very flexible ways with little effort.
        </P>
        <P>
            For an example of this, let's imagine a system that lets you create visualizations
            of data, e.g. a chart that groups them according to some criteria. (TODO pic?)
        </P>
        <Code language="typescript">{`
            interface Group<T> {
                title: string
                filter: (T) => boolean
                remoteIp: string
            }

            type ChartGroup<T> = Group<T>|'other'|'missing'
            
            TODO
            
            // TODO: a mix of union/intersection types with overlapping fields
        `}</Code>
        <P>
            Another cool feature can be used with ORMs where we only want to fetch a limited
            set of fields for a particular entity.
        </P>
        <Code language="TypeScript">{`
            interface BookInfo {
                title: string
                author: string
                isbn: string
                pageCount: number
            }

            function loadBook<K extends keyof BookInfo>(fields: K[]): Pick<BookInfo, K> {
                // ...
            }

            ✂
            const info = loadBook([ 'title', 'pageCount' ])

            // The type of \`info\` only has the fields we requested.
            console.log(\`\${info.title} by \${info.💀author💀1}\`)

            // The function also checks the existence of the specified fields, and will 
            // alert us if the structure changes and our fields are no longer valid.
            const info2 = loadBook([ 💀'title', 'edition'💀2 ])
        `}{{ 1: 'TODO', 2: 'TODO' }}</Code>
        <P>
            Yet another use of mapped types can be seem in the <code>immer</code> library that
            creates new immutable objects by specifying a list of changes from existing immutable objects.
            {/* Removal of `readonly` for the draft type */}
        </P>
        <P>
            We can have an enum of possible values, and a corresponding type where each of these
            possible values is its own field.
            {/* mapped types from an enum whose key can be used as a function argument */}
        </P>
        <P>
            Some of these features do not necessarily require a structural type system.
            Sum types for example are present in many nominally typed languages too.
            However, you are often more limited in how you can use them
            <Code language="ceylon">{`
                // TODO: not possible to access shared field unless it's defined in a supertype
                // Highlight the fact that nominally this is strictly a either/or way of looking at things,
                // structurally it basically picks the filed that both types have and combines them together,
                // maybe making some fields with the same name union types in the process.
            `}</Code>
        </P>
        <P>
            And of course, modelling similar structures in a nominally typed language
            is often not all that difficult either.
            <Code language="kotlin">{`
                // TODO: the kibana example with wrappers
            `}</Code>
        </P>
    </EA>

    <P>
        Languages that have a mostly nominal type system include Java, C#, Rust and many more.
    </P>
    <P>Structural typing can be seen in TypeScript, OCaml, ReasonML and others.</P>
    <P>
        Some languages have features of both, for example Go has <code>struct</code>{' '}
        types, which are nominally typed, and <code>interface</code> types, which
        are structurally typed. C++ is usually nominally typed, but its templates
        and the proposed concepts feature have characteristics of a structural type system.
        Scala directly supports both kinds of types.
    </P>
</div>
