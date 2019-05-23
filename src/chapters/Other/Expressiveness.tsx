import * as React from 'react'
import { Anchor, AnchorKey, LinkTo } from 'ui/Anchor'
import { P, ChapterTitle } from 'ui/Structure'
import Code from 'ui/Code'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import Null from './Null'

export default () =>
    <Anchor aid={AnchorKey.Expresiveness}>
        <ChapterTitle>Expressiveness of a type system</ChapterTitle>
        <P>
            All type systems have limitations when it comes to what data structures you can describe in them.
            Especially if we're talking about <em>easily</em> describing data, without having to resort to
            overly complicated, convoluted designs, lot of code duplication, or other undesirable tradeoffs.
        </P>
        <P>
            For example, TypeScript only has one type to represent a number (because of the underlying JavaScript run-time).
            It's called <code>number</code>. There is no way to differentiate between integers and floating point numbers,
            and therefore no way to <em>express</em> that a certain value is always an integer.
        </P>
        <Code language="typescript">{`
            function summary(year: number) { }
        `}</Code>
        <P>
            In the above function, only positive integers are valid values for the <code>year</code> parameter, but
            we have to use a <LinkTo aid={AnchorKey.WiderNarrower}>wider</LinkTo> type than the most accurate one possible.
        </P>
        <P>
            We could "simulate" an integer by creating our own object type and implementing the arithmetic operations
            as functions, while hiding the underlying data. However, this would be very clunky to use. We would have
            to convert back and forth all the time in order to interact with any 3rd party code, and overall the
            whole effort just wouldn't be worth it.
        </P>
        <P>
            In the above example, having to use <code>number</code> to represent a year is no big deal.
            Let's look at a few more serious cases, where the inability to express certain facts about our data
            structure leads to real world issues.
        </P>
        <P>
            <EL eid={EK.Null} example>Null and the billion dollar mistake</EL>
        </P>
        <Null />
        <P>
            <EL eid={EK.ExpressivenessFeatures} example>Sum types, generics, and other type system features</EL>
        </P>
        <EA eid={EK.ExpressivenessFeatures}>
        <ul>
            <li>
                <h4>Sum types, union types</h4>
                TODO: expressing the fact that there is a closed set of possible types, not expressible via standard
                inheritance
                <P>
                    Also known as <EL eid={EK.TaggedUnion}>tagged</EL> unions, sum types literally express the fact that
                    data can have one of the specified concrete types, but no other. A simple example would be
                    the type <code>int|string</code>, where data of this type can be either an <code>int</code>,
                    or a <code>string</code>.
                </P>
                <EA eid={EK.TaggedUnion}>
                    The "tagged" part of the term tagged union means that the type contains a way to determine
                    which of the concrete types it is at any given moment. In contrats, unions in the C language
                    are untagged, and the type information must be stored separately.
                </EA>
            </li>
            <li>
                <h4>Generics</h4>
                <P>
                    Generics allow the parameterization of types with other types. They are everywhere a "wrapper"
                    type needs to contain an arbitrary piece of data TODO. Examples include:
                </P>
                <P>
                    An example of an idea that can be expressed with generics is
                    <blockquote>This function's return type is the same as its argument</blockquote>
                </P>
                <ul>
                    <li>common data structures, e.g <code>{'List<Message>'}</code>, <code>{'Map<String, UserId>'}</code></li>
                    <li>async primitives and streams, e.g. <code>{'Promise<number>'}</code>, <code>{'Flux<Weather>'}</code></li>
                    <li>wrappers with a specific kind of data inside, e.g. <code>{'HttpResponse<LoginInfo>'}</code></li>
                </ul>
            </li>
            
        </ul>
        </EA>
        <P>
            <EL eid={EK.EaseOfUse} example>Ability to express things and ease of use</EL>
        </P>
        <EA eid={EK.EaseOfUse}>
        </EA>
        <P>
            <EL eid={EK.ExpressImmutability} example>Ways to express immutability</EL>
        </P>
        <EA eid={EK.ExpressImmutability}>
            
        </EA>
    </Anchor>
