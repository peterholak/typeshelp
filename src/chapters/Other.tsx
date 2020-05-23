import * as React from 'react'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import { P, ChapterTitle, ExternalLink } from 'ui/Structure'
import Duck from 'chapters/Other/Duck'
import WiderNarrower from 'chapters/Other/WiderNarrower'
import Expressiveness from 'chapters/Other/Expressiveness'
import PossibleValues from 'chapters/Other/PossibleValues'
import Code from 'ui/Code'
import { LinkTo, Anchor, AnchorKey } from 'ui/Anchor'
import Defensive from 'chapters/Other/Defensive'

const Other = () => <div>
    <EL eid={EK.OtherTerms}>Other terms and topics</EL>
    <EA eid={EK.OtherTerms}>
        <WiderNarrower />
        <PossibleValues />
        <Expressiveness />
        <Duck />
        <div>
            <ChapterTitle>Optional typing</ChapterTitle>
            <P>
                Some languages have static type checking as a feature, but also let the programmer
                have untyped, dynamic variables in their code.
            </P>
            <P>
                In TypeScript, the <code>any</code> type acts as a sort of wildcard.
            </P>
            <ul>
                <li>
                    <Anchor aid={AnchorKey.OptionalFirst} useParent>
                    all values can be assigned to a variable of the <code>any</code> type
                    <Code language="typescript">{`
                    function saveForLater(data: any) { /* ... */ }
                    saveForLater("string")
                    saveForLater({ name: 'Jim', id: 10 })
                    `}</Code>
                    </Anchor>
                </li>
                <li>
                    value with type <code>any</code> can be assigned into all variables regardless of their type
                    <Code language="typescript">{`
                    function checkMessage(message: Message) { /* ... */ }
                    const message: any = await loadFromServer("/message")
                    checkMessage(message)
                    `}</Code>
                </li>
                <li>
                    property access is not statically checked on variables of the <code>any</code> type
                    <Code language="typescript">{`
                    const message: any = await loadFromServer("/message")
                    const exited = message.existedBefore(message.author.registeredOn)
                    `}</Code>
                </li>
                <li>
                    variables of <code>any</code> are allowed to be called as functions, with unchecked arguments
                    <Code language="typescript">{`
                    // \`getOperationFor\` in this example has \`any\` return type
                    const operation = getOperationFor(data)
                    operation(1, 2, 3, 4)
                    `}</Code>
                </li>
            </ul>
            <P>
                The tradeoffs between static and dynamic typing then mostly apply as usual.
            </P>
            <P>
                TypeScript supports a <code>noImplicitAny</code> option,
                enabled by default in its strict mode, that helps avoid accidental <code>any</code> variables in the code.
            </P>
            <P>
                C#'s <code>dynamic</code> type behaves in a very similar way.
            </P>
            <P>
                While languages such as Java have a base <code>Object</code> (or equivalent) type that can contain any value,
                only <LinkTo aid={AnchorKey.OptionalFirst}>the first</LinkTo> of the above points holds true in there. Such a language is not considered to use optional typing,
                it merely has a <LinkTo aid={AnchorKey.WiderNarrower}>top type in a static hierarchy</LinkTo>.
            </P>
            <P>
                A schema-free structure similar to the just using <code>message.author.registeredOn</code> above, without
                it being explicitly defined anywhere, would have to be represented via <LinkTo aid={AnchorKey.MapsStringKeys}>maps
                with string keys</LinkTo> in a static language. Of course, if the code accesses those specific keys
                (<code>author</code>, <code>registeredOn</code>), there is a kind of implicit, expected schema to the structure anyway.
            </P>
        </div>
        <div>
            <ChapterTitle>Sound/unsound type system</ChapterTitle>
            <P>
                This chapter is not yet complete, check back later.
            </P>
        </div>
        <div>
            <Anchor aid={AnchorKey.Implementation} useParent>
            <ChapterTitle>Implementation concerns, performance, run-time type information, reflection, type erasue, reified types</ChapterTitle>
            <P>
                This chapter is not yet complete, check back later.
            </P>
            </Anchor>
        </div>
        <div>
            <Anchor aid={AnchorKey.Opaque} useParent>
            <ChapterTitle>Opaque type</ChapterTitle>
            <P>
                Consider the following piece of C code.
            </P>
            <Code language="c">{`
                recording_context_t ctx = create_recording_context();

                record_operation(ctx, my_operation, 5);
                if (operation_supported(ctx, OPERATION_COUNT)) {
                    // ...
                }

                destroy_recording_context(ctx);
            `}</Code>
            <P>
                We know that the type <code>recording_context_t</code> probably holds some configuration or state across
                multiple function calls, but all of its structure is an implementation detail of whatever library
                we are using in the example. It can even use different implementations on different platforms.
            </P>
            <P>
                This type is <em>opaque</em> to our code—a black box that we can't operate on directly—if it's a pointer to a struct,
                we cannot access the struct's members. We may not even know whether it's a struct internally—could just be a numeric identifier.
                We can only pass it back into the library.
            </P>
            <P>
                The <code>FILE</code> structure from C's standard library is usually used as an opaque type.
            </P>
            <P>
                If our example above used a more object-oriented design and language, the library could group all the supported methods
                (e.g. <code>record_operation</code>) into an interface, which would then serve as the type
                for the <code>recording_context</code>.
            </P>
            <Code language="c++">{`
                class recording_context {
                public:
                    void record_operation(operation_type operation, int count) = 0;
                    bool operation_supported(operation_type operation) = 0;
                };
            `}</Code>
            <P>
                However, many APIs are written with C in mind (which is easy to use from other languages) and are
                deliberately not object-oriented. WebGL for example closely follows the structure of OpenGL, even though
                it is meant for JavaScript. When we don't group data and behavior into a single type, we are left with
                a data structure that has no public data members.
            </P>
            <P>
                Opaque types can present <ExternalLink href="https://github.com/Microsoft/TypeScript/issues/5855">cetain
                issues</ExternalLink> to <LinkTo aid={AnchorKey.StructuralNominal}>structural type systems</LinkTo>,
                because from the type checker's point of view, they are all empty (no structure), and thus equivalent.
            </P>
            </Anchor>
        </div>
        <Anchor aid={AnchorKey.Defensive}>
            <Defensive />
        </Anchor>
    </EA>
</div>

export default Other
