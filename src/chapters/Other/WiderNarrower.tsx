import * as React from 'react'
import { Anchor, AnchorKey, LinkTo } from 'ui/Anchor'
import { P, ChapterTitle } from 'ui/Structure'
import { TypeRect, InheritanceArrow, typeRectSize } from 'ui/Diagrams'
import { Themed } from 'Styles';

export default () =>
    <Themed>{ (_, __, theme) =>
        <Anchor aid={AnchorKey.WiderNarrower}>
            <ChapterTitle>Wider/narrower type, subtype/supertype</ChapterTitle>
            {/*
            (TODO: links, kotlinconf talk (more of them, incl one with the nullable parallel hierarchy), LSP,
                maybe have a separate section on LSP, maybe also link it with expresiveness? C++ talk with type cardinality)
            */}
            <P>
                These are two different, but closely related concepts.
            </P>
            <P>
                Types in most type systems form a hierarchy where some types are considered to be <strong>subtypes</strong> of others,
                and conversely there are <strong>supertype</strong> relationships in the opposite direction.
            </P>
            <div style={{maxWidth: '100%', overflow: 'auto'}}>
                <svg
                    preserveAspectRatio="xMinYMin meet"
                    viewBox={`0 0 ${typeRectSize.width * 4} ${typeRectSize.height * 4}`}
                    style={{width: '100%', maxHeight: '12rem'}}
                    >
                    <TypeRect theme={theme} text="Device" x={1} y={0} />
                    <TypeRect theme={theme} text="Lightbulb" x={0.3} y={2.5} />
                    <TypeRect theme={theme} text="TV" x={1.75} y={2.5} />
                    <InheritanceArrow theme={theme} fromX={1.75} fromY={2.5} toX={1} toY={0} targetOffset={0.75} />
                    <InheritanceArrow theme={theme} fromX={0.3} fromY={2.5} toX={1} toY={0} targetOffset={0.25} />
                </svg>
            </div>
            <P>
                This classic example of inheritance demonstrates that <code>Lightbulb</code> and <code>TV</code> are
                both <em>subtypes</em> of <code>Device</code>. And <code>Device</code> is <em>supertype</em> of
                both <code>Lightbulb</code> and <code>TV</code>
            </P>
            <P>
                Whether this hierarchy is explicit, as in <LinkTo aid={AnchorKey.StructuralNominal}>nominal typing</LinkTo>,
                or implicit as in <LinkTo aid={AnchorKey.StructuralNominal}>structural typing</LinkTo>, what always holds
                is that <em>a more concrete type (a subtype, e.g. <code>Lightbulb</code>) can be used in a place of a more
                general type (a supertype, e.g. <code>Device</code>)</em>, at least as far as the type system is concerned (TODO: LSP, contracts, etc.).
            </P>
            <P>
                Similarly, <strong>wider</strong>/<strong>narrower</strong> types are all about the the information
                contained in data of some type.
            </P>
            <P>
                A conversion from an <code>int32</code> to an <code>int64</code> is
                a <em>widening</em> conversion, because an <code>int64</code> variable
                can hold every possible value that an <code>int32</code> can hold, and more.
                The opposite is a <em>narrowing</em> conversion, and requires us to handle the case
                where the value is outside of what can be represented by our destination type (<code>int32</code> in this case).
            </P>
            <P>
                In the same vein, a conversion from a <code>Lightbulb</code> to a <code>Device</code> is widening, and the opposite
                is narrowing. In object-oriented languages, these are also referred to as an <em>up-cast</em> (widening, always
                succeeds—every <code>Lightbulb</code> we have is always a <code>Device</code>) and a <em>down-cast</em> (narrowing,
                can fail—what if the <code>Device</code> we have is not a <code>Lightbulb</code>?, failure should be handled somehow in code).
            </P>
        </Anchor>
    }</Themed>
