import * as React from 'react'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import { Anchor, AnchorKey, LinkTo } from 'ui/Anchor'
import Code from 'ui/Code'
import { P } from 'ui/Structure'

export default () =>
    <Anchor aid={AnchorKey.Inference} useParent={true}>
        <h3>Explicit types and type inference</h3>
        <P>
            In <strong>some</strong> static languages you have to explicitly write down the types
            in many places.
        </P>
        <Code language="java" displayedLanguage="Java 9">{`
            public ▶Weather◀ getWeather(▶Location◀ place, ▶DateTime◀ dateTime) {
                ▶Map<String, Weather>◀ weather = loadAllWeatherOn(dateTime);
                return weather.get(place.getFullName())
            }
        `}</Code>
        <P>
            These days, <EL eid={EK.InferenceC} unimportant>practically all</EL> of the popular
            static langauges have some amount of type inference.
        </P>
        <EA eid={EK.InferenceC}>
            A notable exception is C, which is a small language with relatively few features on purpose.    
        </EA>
        <P>
            <strong>Type inference</strong> is the ability of a statically typed language to automatically
            determine types without the programmer having to explicitly write them down.
            The most common way of determining the type is from the initial value.
        </P>
        <Code language="java" displayedLanguage="Java 10">{`
            // Type of \`weather\` is inferred from the return type of \`loadAllWeatherOn\`.
            ▶var◀ weather = loadAllWeatherOn(dateTime);
        `}</Code>
        <P>
            <EL eid={EK.ExampleExplicit} example>More examples</EL>
        </P>
        <EA eid={EK.ExampleExplicit}>
            <P>
                In Java, prior to Java 10, you had to explicitly annotate all function parameters, return types and variables.
                Java 10 added type inference for local variables (see examples above).
            </P>
            <P>
                In Kotlin, you can omit the types of both variables and fields. The type will be automatically inferred from the initial value.
                Function parameters and <EL eid={EK.KotlinReturnTypes} unimportant>return types</EL> still need to be annotated.
            </P>
            <EA eid={EK.KotlinReturnTypes}>
                Kotlin also has an expression syntax for functions. When using this syntax, return types can also be inferred.
                <Code language="kotlin">{`
                    // The return type \`String\` is inferred.
                    fun withLength(s: String) = "\$s(\${s.length})"
                `}</Code>
            </EA>
            <Code language="kotlin">{`
                fun getWeather(place: Location, dateTime: DateTime): Weather? {
                    ▶val weather = loadAllWeatherOn(dateTime)◀
                    return weather[place.fullName]
                }
            `}</Code>
            <P>
                TypeScript can also infer the return type of functions.
            </P>
            <Code language="typescript">{`
                // Hover over function name to see its type.
                function 👉getWeather👈1️(place: Location, dateTime: Date) {
                    const weather = loadAllWeatherOn(dateTime)
                    return weather[place.fullName]
                }
            `}{{1: 'function getWeather(place: Location, dateTime: Date): Weather|undefined'}}</Code>
            <P className="separated">
                Some languages, such as Rust, have more advanced type inference that can
                determine types from the variable's usage later in the code.
            </P>
            <Code language="rust">{`
                let mut vec = Vec::new();

                // This will cause the compiler to use the type \`Vec<i32>\` for \`vec\`.
                vec.push(5);
            `}</Code>
        </EA>
        <P>
            Some people feel that relying a lot on type inference can worsen readability. These concerns
            are usually addressed with <EL eid={EK.InferenceReadability}>editor features</EL>.
        </P>
        <EA eid={EK.InferenceReadability}>
            <P>
                In order to preserve the readability, editors usually have a feature
                that lets you see the type of any variable on hover, or a keystroke (or even all the time).

                Try hovering (on mobile, clicking) over the variables in the following block of code to see this in action.
            </P>
            <Code language="kotlin">{`
                val 👉emails👈1 = 👉result👈2.👉users👈3.👉map👈4 { 👉it👈5.👉email👈6 }
            `}{{
                1: 'val emails: List<String>',
                2: 'val result: FetchResults',
                3: 'val users: List<User> 🖊in🖊 FetchResults',
                4: 'fun map((T) -> R): List<R> 🖊in🖊 Iterable<T>',
                5: 'it: User',
                6: 'val email: String 🖊in🖊 User'
            }}</Code>
            <P>
                The downside is that this feature may not be available in various web-based tools, e.g. while reviewing
                a pull request on GitHub. That can be solved by making better web tools, or using browser extensions (TODO: sourcegraph?),
                but most people just don't bother.
            </P>
        </EA>
        <P>
            Although most static languages have type inference, you can still choose
            to explicitly specify types even in places where they are not required. This is
            useful when you need to use a <LinkTo aid={AnchorKey.WiderNarrower}>wider type</LinkTo> than
            the initial value.
            <Code language="Kotlin">{`
                // The type of \`temperature\` is \`Double\`, but we'll need to assign something
                // else to \`lastSeenValue\` later on...
                var lastSeenValue: Any = homeWeather.temperature
            `}</Code>
        </P>
        <div>
            <P>
                In dynamic languages, you don't annotate anything—the type will only be determined once the program execution reaches that part of code.
            </P>
            <Code language="lua">{`
                ▶function◀ getWeather(▶place◀, ▶dateTime◀) {
                    ▶local◀ weather = loadAllWeatherOn(dateTime)
                    return weather(place:getFullName())
                }
            `}</Code>
        </div>
    </Anchor>