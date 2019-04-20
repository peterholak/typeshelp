import * as React from 'react'
import { Anchor, AnchorKey, LinkTo } from 'ui/Anchor'
import { P } from 'ui/Structure'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'

export default () =>
    <Anchor aid={AnchorKey.Workflows} useParent={true}>
        <h3>Effects on workflow</h3>
        <P>
            (TODO: not the best name, maybe just name it "static typing and schemas" or something)
            A good analogy is that static typing makes you <strong>define a schema</strong> for the data
            structures in your program, while dynamic typing is more akin to simply accessing fields by name (TODO: confusing)
            and relying on the people writing the code (plus sometimes tests) to get it right.
        </P>
        <P>
            The amount of effort that static typing requires is directly related to the
            {' '}<LinkTo aid={AnchorKey.Expresiveness}><strong>expressiveness</strong></LinkTo>{' '} of the type system (TODO link).
        </P>
        {/* TODO: weather example, unit tests missed it, who fucked up? (when there is no spec) */}
        <P>
            <EL eid={EK.StaticSchema} example>Example</EL>
        </P>
        <EA eid={EK.StaticSchema}>
            TODO example: mini-schema for a domain vs. directly accessing fields on a JS object literal
            TODO: interacting with external systems, codegen and ORM, REST/Swagger as producer/consumer, GraphQL, sqldelight, etc.
        </EA>
    </Anchor>