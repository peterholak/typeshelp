import * as React from 'react'
import { Anchor, AnchorKey, LinkTo } from 'ui/Anchor'
import { P, ExternalLink } from 'ui/Structure'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import Code from 'ui/Code'

export default () =>
    <Anchor aid={AnchorKey.TestsSchemasSpecs} useParent={true}>
        <h3>Types and tests, schemas, specifications</h3>
        <P>
            Software (libraries, console applications, servers, ...) that you interact with programmatically
            almost always has a defined API—an application programming interface. In some circles, the term API is
            mostly been used to refer to HTTP-based interfaces, but it covers much more.
        </P>
        <P>
            A library will typically have a set of functions that you can call—these form that
            library's API. Let's look at Go's <code>template.ParseFiles</code> function.
        </P>
        <Code language="go">{`
            // ParseFiles creates a new Template and parses the template definitions
            // from the named files. The returned template's name will have the base
            // name and parsed contents of the first file. There must be at least one
            // file. If an error occurs, parsing stops and the returned *Template is nil.
            func ParseFiles(filenames ...string) (*Template, error)
        `}</Code>
        <P>
            This portion of the API—both the types and the behavior described in the comment—specifies a certain <strong>contract</strong> about this function.
            It <em>requires</em> the caller to pass in certain arguments, and in return
            it <EL eid={EK.Contract}><em>guarantees</em> certain behavior</EL>.
        </P>
        <EA eid={EK.Contract}>
            <P>
                In the example above, a part of the contract that is the caller's responsibility to fulfil would
                include the following
            </P>
            <ul>
                <li>the function is called with a number of <code>string</code> arguments</li>
                <li>every argument must represent an existing, readable file</li>
                <li>there must be at least one argument</li>
                <li>the contents of every file must conform to the specification of the templating language</li>
            </ul>
            <P>
                It is then the library's (the callee's) responsibility to
            </P>
            <ul>
                <li>return nil as the <code>*Template</code> result if the parsing fails</li>
                <li>return a non-nil value as the <code>error</code> part of the result if the parsing fails
                    and nil if it succeeds</li>
                <li>stop the parsing at the first encountered error</li>
                <li>create a return a <code>Template</code> when the parsing succeeds</li>
                <li>the returned template must be of a type that you can call the <code>Name()</code> function on,
                    and <code>t.Name()</code> should return the base name of the first file (some of this is
                    specified as part of the <code>Template</code> struct)</li>
                <li>and a bunch of other things</li>
            </ul>
            <P>
                If you look at the function signature, it should be apparent that a portion of this contract
                is captured in the function argument types and return types. But not all of it—some of it is left
                for the documentation comment, because there is no way to express all of it with just the programming language.
                The <LinkTo aid={AnchorKey.Expresiveness}>ability of different programming languages to express facts</LinkTo> varies,
                but there will almost always be some part left up to the human to enforce.
            </P>
            <P>
                The part that can be expressed with the types will be verified by the compiler during compilation
                (and possibly by the IDE during typing). For example it will check that the arguments should be
                plain strings, instead of some kind of <code>File</code>, or <code>Path</code>, or even <code>Url</code> structures,
                that are often used in other APIs.
            </P>
            <P>
                If we were using a dynamically typed language instead, it would be a person's job to make
                sure that the type portion is fulfilled in addition to the rest of the contract.
                Most functions don't specify what happens in case we pass in the wrong types—they provide
                no guarantees in such a case, and it is not their responsibility—garbage in, garbage out.
                The notion that you rely on the other side fulfilling its end of the contract without
                checking at run-time it is also one part of the <LinkTo aid={AnchorKey.Duck}>duck typing</LinkTo> principle.
                Such a notion is the opposite of <LinkTo aid={AnchorKey.Defensive}>defensive programming</LinkTo>.
            </P>
        </EA>
        <P>
            It order to call a group of functions an API, there typically has to be an intent
            for these to be used by the library consumers (as opposed to private/internal functions),
            some kind of guarantee that their behavior will not just change on a whim (for example when
            the underlying implementation has to change), and maybe some documentation.
            In other words, APIs are expected to have at least <em>some</em> stability guarantees.
        </P>
        <P>
            Checking that pieces of code fulfill the contract they have specified is the role of automated
            tests—both <strong>unit tests</strong> that test individual pieces of code in isolation,
            and <strong>integration tests</strong> which can work with many different pieces together.
        </P>
        <P>
            In order to test conformance to a contract, we must
            first <em>know what the contract is</em>. This may seem obvious, but poorly specified,
            under-documented APIs that you have to try out to see what they're going to do in various situations,
            are far more common than they should be.
        </P>
        <P>
            Going back to our <code>template.ParseFiles</code> function above, here is an example unit test that checks
            whether the template's name really has the base name
        </P>
        <Code language="go">{`
            func TemplateHasCorrectName(t *T) {
                result, err := template.ParseFiles()
                TODO
            }
        `}</Code>
        <P>
            TODO: we also get a little bit of type checking for free with this test (e.g. how in function uses the file api),
            but we don't get the proper specification (menioned below later with the weather example) plus the difficulty of changes is not really comparable?
        </P>
        <P>
            Publicly available libraries usually have a stable API—they don't change their contracts
            once a version has been relased in order to stay backwards compatible.
            They may relax the rules around what is expected of the caller (i.e. they may accept a wider range of values),
            and they may choose to provide stricter guarantees (i.e. return only a subset of the previously returned values),
            but not the other way around. Of course this is not always 100% perfect in
            practice. <ExternalLink href="https://semver.org">Semantic versioning</ExternalLink> is one way of
            signaling whether some contract has changed in a backwards incompatible way.
        </P>
        {/* TODO: before/after example */}
        <P>
            Public libraries are never the <em>only</em> code that we interact with. Function calls
            and data structures more often flow between various parts of the same internal codebase.
            Internal code tends to provide fewer guarantees and can change its contract far more frequently,
            as this is not such a disruptive operation—often all consumers of that code can be adapted
            on the spot, together with the original change.
        </P>
        {/* TODO: before/after example. also good that more frequent example break the flow of the monotonic boring text. */}
        <P>
            If we don't have contracts between parts of the code well specified, such internal refactorings
            become error-prone, and just plain annoying to do. We have to do a lot of manual checking and re-checking
            as to what is used where in what way. And even then we may still introduce bugs that don't get discovered
            until much later. Having to be constantly on edge about what every change in the code can potentially break
            slows people down and saps all the fun right out of programming.
            {/* maybe mention how some patterns literally only exist to avoid the need for such changes,
            but sometimes at the cost of a rigid clunky overengineered design - in an expandable part */}
            {/* also weather example is a example of underspecification */}
        </P>
        <P>
            As mentioned above, having well designed tests can alleviate most of this problem.
        </P>
        <P>
            Static typing is pitched as one way to quickly and easily specify a portion of these contracts,
            and thus make internal refactorings easier and more pleasant.
            (TODO show some actual selling points that languages claim in this part)
            Catchphrases such as <em>"refactor with confidence"</em> {/* TODO: source/external link */} show that this is an emotional issue
            as much as it is a technical issue. Machines may have a reputation for preferring a clear unambiguous world,
            but humans don't much like uncertainty and shakiness either.
            {/* possibly link to expressiveness and the ease of expression part, to answer the sort of obvious
            follow-up question as to why dynamic languages still exist then*/}
        </P>
        <h4>Schema of internal structures</h4>
        <Anchor aid={AnchorKey.WeatherFirst}>
        <P>
            Static typing generally makes us define a sort of <em>schema</em> for the internal structures used in a program.
            Both the function signatures and their argument types and return types form this schema.
            Consider the following block of dynamically typed code.
        </P>
        <Code language="javascript">{`
            // Let's pretend the values are not dummy values, etc.
            function decodeWeather(encodedWeatherString) {
                return { temperature: 50, windDirection: 'east', location: 'Moscow, Russia' }
            }
        `}</Code>
        </Anchor>
        <Anchor aid={AnchorKey.WeatherSecond}>
        <P>
            You use this function and all is well. A few months later, another person adds
            a different way of obtaining weather.
        </P>
        <Code language="javascript">{`
            async function fetchWeather(url) {
                return {
                    temperature: 20,
                    windDirection: 'east',
                    time: new Date(),
                    // This relies on the \`WeathersLocation\` class's \`toString\`.
                    location: new WeatherLocation('Jakarta', 'Indonesia')
                }
            }
        `}</Code>
        </Anchor>
        <Anchor aid={AnchorKey.WeatherThird}>
        <P>
            Some time passes. A third person comes along and needs a way to display the weather in the UI.
            This person obtains some weather object, looks at its structure in
            a debugger (or just prints it), and writes the following code.
        </P>
        <Code language="javascript">{`
            function formatWeatherMessage(weather) {
                return trimLines(\`
                    It was \${weather.temperature}
                    on \${dayOfWeek(weather.time.getDay())}
                    in \${weather.location.city}, \${weather.location.country}.
                \`)
            }
        `}</Code>
        </Anchor>
        <P>
            Can you see the problem? We have two slightly different ways of representing weather—one of them
            includes an information about time and one doesn't. One's <code>location</code> field is a string,
            and the other one's is an object with a custom <code>toString</code> on its prototype.
        </P>
        <P>
            The <code>formatWeatherMessage</code> function however assumes that time will be present,
            and that location will be an object with specific fields.
            If we call it with the weather we obtained from <code>decodeWeather</code>, the program will fail.
        </P>
        <P>
            Now a more fun question: which part is actually "wrong"?
        </P>
        <ul>
            <li>Should the second person have modified the original <code>decodeWeather</code> to also include time?</li>
            <li>Should the third person have realized that <code>time</code> is optional and added a check?</li>
            <li>Should the second person have just used a string for the location, or modified <code>decodeWeather</code>
            to use the same object format?</li>
        </ul>
        <P>
            What could have prevented the whole situation is a <strong>schema</strong> for our weather variables.
            Let's try making one in TypeScript.
        </P>
        <Code language="typescript">{`
            // The original code written by the first person
            interface Weather {
                temperature: number
                windDirection: 'east'|'west'|'north'|'south'
                location: string
            }

            function decodeWeather(encodedWeatherString: string): Weather {
                // ...
            }
        `}</Code>
        <P>
            Then when the <LinkTo aid={AnchorKey.WeatherSecond}>second</LinkTo> person tries to write their new function, they will get a red squiggly line
            in their editor. The options are then to either return data in a form that matches the existing type,
            or modify the type itself. Modifying the type will break the existing <code>decodeWeather</code> function
            (the compiler will complain), which will in turn need to be adapted, and things will just go from there.
        </P>
        <P>
            We could decide that both of the above mentioned forms of weather are valid, and change neither function.
        </P>
        <Code language="typescript">{`
            // This type is flexible enough to support both functions,
            // but then everyone who consumes \`Weather\` objects has to deal with all
            // the different possibilities.
            interface Weather {
                temperature: number
                windDirection: 'east'|'west'|'north'|'south'
                location: string|WeatherLocation
                time?: Date
            }

            class WeatherLocation {
                constructor(
                    public city: string,
                    public country: string
                ) { }

                toString() { return \`\${this.city}, \${this.country}\` }
            }
        `}</Code>
        <P>
            Here it would be our <LinkTo aid={AnchorKey.WeatherThird}>third</LinkTo> person—the one who wrote <code>formatWeatherMessage</code>—who would
            get the red squiggly lines and be forced to add checks to the code. No matter how we define the interface,
            all of its producers and all of its consumers have to agree on how a <code>Weather</code> object looks like. 
            The interface definition also serves as documentation for human readers.
        </P>
        <P>
            Another interesting question is, how will the unit tests for these function look?
        </P>
        <P>
            From the name of <code>decodeWeather</code>'s <code>encodedWeatherString</code> parameter, we can clearly tell
            that this function will be decoding some kind of encoded string that represents weather. This kind of function
            is extermely easy to design a test for. It's the "best case scenario" of test examples, where you have
            a pure function(TODO: definition?) that only calculates an output from its inputs.
            TODO
        </P>
        {/* TODO: weather example, unit tests missed it, who fucked up? (when there is no spec) */}
        {/* TODO: class-based dynamic languages where some schema is still defined, though how is e.g. JSON represented there */}
        {/* what dynamicness is then used at all though? is those */}
        {/* perhaps some things like date/time/timezones/etc. */}
        {/* modeling a domain */}
        {/* split this shit into expandable section, carefully pick which part will remain above the fold */}
        {/* this section can be linked to from various other sections, including some nullability examples
          and maybe the defensive vs. unwritten part */}
        {/* what can be expressed varies with the expressiveness(duh) of the language */}
        {/* maybe do something about the overly dry and boring tone of the whole thing, maybe some jokes (e.g. is-odd npm) */}
        <P>
            <EL eid={EK.StaticSchema} example>Example</EL>
        </P>
        <EA eid={EK.StaticSchema}>
            TODO example: mini-schema for a domain vs. directly accessing fields on a JS object literal
            TODO: interacting with external systems, codegen and ORM, REST/Swagger as producer/consumer, GraphQL, sqldelight, etc.
        </EA>
    </Anchor>