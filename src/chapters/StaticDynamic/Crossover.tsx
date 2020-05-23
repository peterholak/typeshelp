import * as React from 'react'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import Code from 'ui/Code'
import { LinkTo, AnchorKey, Anchor } from 'ui/Anchor'
import { P } from 'ui/Structure'

export default () =>
    <Anchor aid={AnchorKey.BlackAndWhite} useParent={true}>
        <h3>Crossover</h3>
        <P>
            The differences between static and dynamic languages are not completely black and white.
            There are always some "dynamic" features - ways to express <EL eid={EK.StaticDynamicFeatures}>polymorphism</EL>{' '}
            in statically typed languages—situations where the concrete type will only be known at run-time.
        </P>
        <P>
            On the other side, you can perform
            {' '}<EL eid={EK.DynamicStaticAnalysis}>limited static analysis</EL> even on dynamically typed code.
        </P>
        <P>
            The ability to statically analyze code is important for IDEs and other tools that offer
            {' '}<EL eid={EK.StaticIde}>code editing assistance</EL>.
        </P>
        <EA eid={EK.StaticDynamicFeatures}>
            <h3>Run-time polymorphism in statically typed languages</h3>
            <P>
                Statically typed code usually aims to have as much information about its data
                as possible available at compile-time, so that it can be checked
                and <LinkTo aid={AnchorKey.StaticIde}>utilized by tools</LinkTo>.
            </P>
            <P>
                However, there are many situations where there is more than one possible type that a variable
                can have, and the concrete case is only knowable at run-time. Similarly, it is possible to write
                a function that can work with more than just one type of a particular argument.
            </P>
            <P>
                (TODO the link should be here, not further down, and this should be rephrased a bit, and shortened ideally)
                This is where the type hierarchy and the subtype/supertype (wider/narrower type) relationships
                come into play. The idea here is that <strong>any data whose type fulfills certain
                requirements</strong> (e.g. has a certain method) can be used in place of the specified type. Code working
                with such data can only access the parts that are described by the requirements (unless it casts
                TODO expresiveness link/pattern matching/etc. it to a concrete subtype).
            </P>
            <P>
                For more information on this, see the section
                about <LinkTo aid={AnchorKey.WiderNarrower}>type hierarchy</LinkTo>. How you specify these
                requirements is the major difference between <LinkTo aid={AnchorKey.StructuralNominal}>structurally
                and nominally</LinkTo> typed languages.
            </P>
            <Code language="C#">{`
                interface TODO (example concrete class, subtype parts cannot be accessed)
            `}</Code>
            <P>
                One of the main characteristics of object-oriented programming is the recommendation that
                you shouldn't care about the concrete type and only program to an interface. This doesn't
                apply to all situations (for example it may not make sense to extract an interface from
                a <code>User</code> data class when you're writing a login system), but can lead
                to more loosely coupled and better testable system.
                (TODO example with SharedPreferences?)
            </P>
            <P>
                The same philosophy of not caring about the concrete type appears
                in the <LinkTo aid={AnchorKey.Duck}>duck typing</LinkTo> style
                used with dynamic languages, only without the explicitly defined interfaces.
            </P>
            <P>
                <EL eid={EK.OoInterface} example>Example</EL>
            </P>
            <EA eid={EK.OoInterface}>
                TODO (repository, testing, etc.)
            </EA>
            <P>
                Ways to represent things not knowable or allowed at compile-time in statically typed languages
                are mentioned in the chapter about <LinkTo aid={AnchorKey.Expresiveness}>expressiveness of type systems</LinkTo>.
            </P>
        </EA>
        <EA eid={EK.DynamicStaticAnalysis}>
            <h3>Static analysis for dynamically typed languages</h3>
            <P>
                Just because you cannot <em>always</em> know the types of variables at compile time,
                doesn't mean you cannot benefit from knowing them <em>sometimes</em>.
            </P>
            <P>
                As mentioned earlier, compilers and IDEs for many statically typed languages can
                {' '}<LinkTo aid={AnchorKey.Inference}>infer types</LinkTo> from a variable's initialization.
            </P>
            <P>
                Some tools for dynamically typed languages can do the same for a subset
                of variables that don't rely on external data or un-analyzable parts of the code.
                Consider the following bit of JavaScript:
            </P>
            <Code language="javascript">{`
                // @ts-check

                class Post {
                    constructor(text) {
                        this.text = text
                        this.createdAt = new Date()
                        // ...
                    }
                    // ...
                }

                function createAcceptedPost() {
                    // Maybe in the past, this used to just return the text...
                    return new Post('Your vote has been accepted!')
                }

                ✂
                const post = createAcceptedPost()
                💀document.getElementById('postText').firstChild.nodeValue💀1 = post
            `}{{1: 'Type 🔧Post🔧 is not assignable to type 🔧string🔧.'}}</Code>
            <P>
                If you put this code into a JavaScript file in VS Code, you will see an error
                similar to the one highlighted.
            </P>
            <P>
                Another form of static analysis is the one performed by linters. Linters are tools
                that check things like conformance to a code style (spaces/tabs, variable names, function length, etc.),
                or warn about common mistakes. Most of these checks are not directly related to types, but
                there are a few which can help. For example, pylint, a linter for Python can point out some nonexistent
                functions and properties.
            </P>
            <Code language="Python">{`
                class Song:
                    def print_info(self):
                        print(f"{self.author} - {self.name}")
                
                    def tag(self, name, author):
                        self.name = name
                        self.author = author
        
                ✂
                now_playing = load_song('file.mp3')
                if should_tag:
                    now_playing.tag("Song", "Author")
                now_playing.print_info()
                💀print(now_playing.get_average_bpm())💀1
            `}{{1: 'E1101: Instance of 🔧Song🔧 has no 🔧get_average_bpm🔧 member.'}}</Code>
            <P>
                Due to the fact that code written in dynamically typed languages often relies on
                dynamic features (e.g. objects having additional properties, but only in some branches
                of the code), these tools are fairly limited in what they can discover.
            </P>
            <P>
                In order to not burden the programmer with tons of false positives, they tend to only
                flag things they can be certain about. Most people don't mind however—after all,
                they didn't choose a dynamic language only to then have to adhere to a strict schema
                everywhere. (TODO: maybe link to the schema workflow thing.)
            </P>
        </EA>
        <EA eid={EK.StaticIde}>
            <h3>Code editing assistance features</h3>
            <P>
                People who prefer static typing often consider the ability of editors to provide
                useful assistance to be one of its main selling points. As mentioned in the previous
                section (TODO link), some of this is also possible with dynamically typed languages,
                but only to a very limited extent.
            </P>
            <P>
                The features most often mentioned include
            </P>
            <ul>
                <li>Code navigation - go to definition, find usages, etc.</li>
                <li>Autocomplete</li>
                <li>Type information and documentation</li>
                <li>Instant error highlighting</li>
                <li>Automated refactoring (mention limitations)</li>
            </ul>
            <P>TODO: mention REPLs in both kinds of languages, link to workflow section</P>
        </EA>
    </Anchor>