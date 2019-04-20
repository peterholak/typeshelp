import * as React from 'react'
import Inference from 'chapters/StaticDynamic/Inference'
import WholeProgram from 'chapters/StaticDynamic/WholeProgram'
import Crossover from 'chapters/StaticDynamic/Crossover'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import Code from 'ui/Code'
import { LinkTo, AnchorKey, Anchor } from 'ui/Anchor'
import { P, SummaryNavigation, MainSection, NavLink } from 'ui/Structure'
import Workflow from 'chapters/StaticDynamic/Workflow'
import Tests from 'chapters/StaticDynamic/Tests'

const StaticDynamic = () =>
    <MainSection>
        <Anchor aid={AnchorKey.StaticDynamic} useParent={true}>
        <h2>Static typing ↔ Dynamic typing</h2>
        <P className="subtitle">Are types assigned when you are writing the program, or when it is running?</P>
        <ul className="summary">
            <li>
                In languages with <strong>static</strong> typing, types are determined
                {' '}<strong>before running the program</strong>{' '}
                (i.e. at <EL eid={EK.CompileTime}><em>compile time</em></EL>).
                <EA eid={EK.CompileTime}>
                    <P>
                        Not all languages with static typing need to have a compilation step.
                    </P>
                    <P>
                        What matters is that it is <strong>possible</strong> to type check the code without running it.
                        Many editors perform this check while you are editing code, to give you immediate feedback.
                    </P>
                    <P>
                        <Code language="typescript">{`
                            return this.data.💀draggingStarted💀1 && this.data.tabDown === key
                        `}{{1: 'Property 🔧draggingStarted🔧 does not exist on type 🔧SplitterInteraction🔧.'}}</Code>
                    </P>
                    <P>
                        The term <em>compile time</em> used throughout this page can be also thought of as <em>edit time</em>.
                    </P>
                </EA>
            </li>
            <li>
                With <strong>dynamic</strong> typing, types are determined during the program's <strong>run time</strong>.
            </li>
        </ul>
        <P>
            This is the basic distinction—but most people will care more about the
            {' '}<EL eid={EK.StaticDynamicMore}>practical implications</EL> of these approaches (examples included).
            <EA eid={EK.StaticDynamicMore}>
                <ul className="more">
                    <li>
                        This section will talk about
                        <SummaryNavigation>
                            <NavLink aid={AnchorKey.Inference}>Type inference</NavLink>
                            <NavLink aid={AnchorKey.WholeProgram}>Whole program correctness</NavLink>
                            <NavLink aid={AnchorKey.BlackAndWhite}>The gray area between these approaches</NavLink>
                            <NavLink aid={AnchorKey.Workflows}>Workflows commonly used with them</NavLink>
                        </SummaryNavigation>
                    </li>
                    <li><Inference /></li>
                    <li><WholeProgram /></li>
                    <li><Crossover /></li>
                    <li><Workflow /></li>
                    <li><Tests /></li>
                    
                    {/*
                        TODO you can make unwritten assumptions in dynamic languages, that you don't have to force-cast, etc.,
                        add fields to objects in many (not all), but you damn better get it correct

                        TODO: maybe a summary at the end of static/dynamic section, there is a LOT of content in this one
                    */}
                </ul>
            </EA>
        </P>
        </Anchor>
    </MainSection>

export default StaticDynamic
