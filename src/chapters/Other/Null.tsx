import * as React from 'react'
import { P, ExternalLink, PersonalOpinion } from 'ui/Structure'
import Code from 'ui/Code'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import { AnchorKey, LinkTo, Anchor } from 'ui/Anchor'

export default () =>
    <EA eid={EK.Null}>
        <P>
            Imagine we have a web dashboard where we can view and manage various IoT sensors and other devices.
            There is a page that displays a quick overview of all our sensors.
        </P>
        <P>
            Consider the following Java structure and its use.
        </P>
        <Code language="java" collapsible={13}>{`
            /** Overview information for a single sensor. */
            class SensorOverview {
                public UUID sensorId;
                public String name;
                public SensorLocation location;
                public Reading latestReading;
            }

            ✂
            class SensorRenderer {
                public Document renderOverview(SensorOverview overview) {
                    return Document.builder()
                        .addLink(detailsUrl(overview.sensorId))
                        .addHeading(overview.name)
                        .addDescription("Located in: " + overview.location.room.name)
                        .addDescription(
                            "Latest reading " +
                            overview.latestReading.value +
                            overview.latestReading.units.toString()
                        )
                        .build();
                }

                // ...
            }
        `}</Code>
        <P>
            Can you tell where inside <code>renderOverview</code> this code might crash?
        </P>
        <P>
            The problem lies in the fact that <em>every field</em> inside our <code>SensorOverview</code> structure
            can potentially have a <code>null</code> value. If <code>latestReading</code> is <code>null</code>,
            trying to evaluate <code>overview.latestReading.value</code> is going to throw a <code>NullPointerException</code>.
        </P>
        <P>
            The mere existence of <code>null</code> is <strong>not</strong> a problem on its own however. What if we
            have a new sensor that we just finished setting up? Of course there isn't going to be any "latest reading" just yet!
            The value <code>null</code> sounds like a perfectly appropriate way to describe such a situation.
        </P>
        <P>
            On the other hand, for <code>sensorId</code> and <code>name</code>, it doesn't make sense to ever be <code>null</code>.
            These should be required fields, that must be filled before any valid sensor can be registered.
        </P>
        <P>
            TODO: very short example here of pointless/redundant checks
        </P>
        <P>
            For the code to be correct, we may need to add null-checks when using some of the fields, but we can't reliably
            tell which ones! And therein lies the problem with the type system of Java, and many other languages.
            We have no way to <em>express the fact that certain values will never be <code>null</code>, and others might</em>.
            In Java, every non-primitive type (the vast majority) can potentially hold a <code>null</code> value.
        </P>
        <P>
            When it comes to the nullability of types, we are—in a sense—back to dynamic typing. We have to rely
            on documentation, convention, additional tests, and perhaps other unwritten assumptions (such as the present state),
            when it comes to how we access the values inside our fields. If in the future, some of these assumptions
            no longer hold true after a number of changes to the codebase, we have a bug on our hands.
        </P>
        <P>
            Incorrect use of <code>null</code> has been the cause of so many bugs and issues over the years, that
            the inventor of (among many other things) the null reference, Tony Hoare, has called it his <em>billion dollar mistake</em>. TODO link
        </P>
        <h4>Ways to express optionality</h4>
        <P>
            Plenty of languages avoid issues with <code>null</code> by simply not having the <code>null</code> value at all,
            or at least not having it as a possible value of most types.
            If we need to express an optional field, the most common way is by using a sum type that wraps the actual value.
        </P>
        <Code language="rust">{`
            enum Option<T> {
                None,
                Some(T),
            }
        `}</Code>
        <P>
            Say we need an integer that must always be present—it would have a type such as <code>i32</code> directly.
            If we need an <em>optional integer</em> instead, we would use <code>{'Option<i32>'}</code>.
        </P>
        <P>
            <code>Option</code> is a different type than <code>i32</code>, and we can't just operate on it like
            we would on a number (e.g. using the <code>+</code> operator).
        </P>
        <P>
            When working with optional values, we can do a manual check
        </P>
        <Code language="rust">{`
            match 👉total_sum👈1 {
                Some(👉sum👈2) => println!("Double the sum is {}", 👉sum👈2 * 2)
                None => println!("There is no sum")
            }
        `}{{
            1: 'total_sum: Option<i32>',
            2: 'sum: i32'
        }}</Code>
        <P>
            transform the value in some way if it is present
        </P>
        <Code language="rust">{`
            // Hover over variables to see their types
            let 👉double_sum👈1 = 👉total_sum👈2.map(|👉sum👈3| 👉sum👈3 * 2);
        `}{{
            1: 'double_sum: Option<i32>',
            2: 'total_sum: Option<i32>',
            3: 'sum: i32'
        }}</Code>
        <P>
            use a default value if it is not present
        </P>
        <Code language="rust">{`
            let 👉double_sum👈1 = 👉total_sum👈2.map(|👉sum👈3| 👉sum👈3 * 2).unwrap_or(0);
        `}{{
            1: 'double_sum: i32',
            2: 'total_sum: Option<i32>',
            3: 'sum: i32'
        }}</Code>
        <P>
            or simply let the program crash in certain situations.
        </P>
        <Code language="rust">{`
            let 👉double_sum👈1 = 👉total_sum👈2.unwrap();
        `}{{
            1: 'double_sum: i32',
            2: 'total_sum: Option<i32>',
        }}</Code>
        <P>
            With this way of representing values that may not be present, Rust doesn't need <code>null</code> in the language.
        </P>
        <P>
            Even Java now has an <code>{`Optional<T>`}</code> type since version 8, which works similar to
            the example above. However, the problem with all non-primitive types being possibly nullable in Java remains.
            We now have a way to express when a value <em>is</em> optional in Java,
            but <EL eid={EK.NullAnnotations} unimportant>no way</EL> to express <em>when it is not</em>.
            A&nbsp;codebase (including all the libraries it uses) would have to enforce a convention
            of using <code>Optional</code> in all appropriate places to be fully safe.
            Languages without <code>null</code> don't have this issue.
        </P>
        <EA eid={EK.NullAnnotations}>
            Alternatively, there are several different 3rd party annotations to express nullability in addition
            to Java's type system. They are usually called something like <code>@Nullable</code> and <code>@NonNull</code>,
            and IDEs and other external tools can check code that uses them and emit warnings. The same issues as
            with Java's <code>Optional</code> remain however.
        </EA>
        <P>
            A different way to express optionality is by keeping the <code>null</code> value in the language,
            but making types that can contain it separate from types that can't. In TypeScript, this can be done
            using union types.
        </P>
        <Code language="typescript" collapsible={7}>{`
            interface SensorOverview {
                sensorId: UUID,
                name: string,
                location: SensorLocation|undefined,
                latestReading: Reading|undefined
            }

            // In JavaScript and TypeScript, \`null\` is distinct from \`undefined\`,
            // and TypeScript also supports optional properties directly,
            // but the basic principle is the same.
        `}</Code>
        <P>
            <EL eid={EK.NullabilityMore}>More.</EL>
        </P>
        <EA eid={EK.NullabilityMore}>
            <P>
                The langauge then won't let us access properties, or perform other operations on values that
                could potentially be <code>null</code> (or <code>undefined</code> in this case).
            </P>
            <Code language="typescript">{`
                function renderOverview(overview: SensorOverview): Document {
                    // \`latestReading\` may not be present, we can't access its properties.
                    const value = 💀overview.latestReading💀1.value

                    // ...
            `}{{
                1: 'Object is possibly 🔧undefined🔧.'
            }}</Code>
            <P>
                If we do a manual check at some point, the type can be automatically narrowed afterwards.
            </P>
            <Code language="typescript">{`
                function renderOverview(overview: SensorOverview): Document {
                    // ...

                    // \`latestReading\` may not be present, we can't access its properties.
                    const value = 💀overview.latestReading💀1.value

                    // We could assert that it exists, and get a run-time error
                    // if it doesn't.
                    const forceValue = overview.latestReading!.value

                    // If \`latestReading\` is not present, we make
                    // the function execution end here.
                    if (overview.latestReading === undefined) {
                        return rendered
                    }

                    // If we got to this point, it will always be present,
                    // and we can just directly access it.
                    const okValue = overview.latestReading.value

                    // If we later remove the above \`return\` from code, the compiler
                    // will point out that the \`okValue\` access is no longer correct.
                }
            `}{{
                1: 'Object is possibly 🔧undefined🔧.'
            }}</Code>
            <P>
                Yet another way to represent nullable types is the way Kotlin does it, by having a language feature
                specifically for this purpose. Normal types can never hold <code>null</code> by default. By adding
                a question mark to the type, we make a nullable type that <em>can</em> hold <code>null</code>.
            </P>
            <Code language="kotlin">{`
                data class SensorOverview(
                    val sensorId: UUID,
                    val name: String,
                    val location: SensorLocation?,
                    val latestReading: Reading?
                )
            `}</Code>
            <P>
                To make nullable variables easy to use, Kotlin contains a number of syntactic sugar features
                to help.
            </P>
            <P>
                We can conditionally access properties if an expression is not <code>null</code>,
            </P>
            <Code language="kotlin">{`
                // Hover over variables to see their types
                val 👉name👈1 = 👉users👈2?.👉firstOrNull()👈3?.👉name👈4
            `}{{
                1: 'name: String?',
                2: 'users: List<User>?',
                3: 'fun List<T>.firstOrNull(): T?',
                4: 'name: String 🖊in🖊 User'
            }}</Code>
            <P>
                return from a function early if an expression is <code>null</code>,
            </P>
            <Code language="kotlin">{`
                val 👉name👈1 = 👉users👈2?.👉firstOrNull()👈3?.👉name👈4 ?: return false
            `}{{
                1: 'name: String',
                2: 'users: List<User>?',
                3: 'fun List<T>.firstOrNull(): T?',
                4: 'name: String 🖊in🖊 User'
            }}</Code>
            <P>
                conditionally call a function if an expression is not <code>null</code> and use a default value if it is
            </P>
            <Code language="kotlin">{`
                val 👉mostUsedWord👈1 = 👉user👈2
                    ?.👉let👈3 { 👉commentStore👈7.👉findMostUsedWord👈4(👉it👈5, 👉stopWords👈6) }
                    ?: "<unknown>"
            `}{{
                1: 'mostUsedWord: String',
                2: 'user: User?',
                3: 'fun T.let((T) -> R): R',
                4: 'fun CommentDatabase.findMostUsedWord(User): String',
                5: 'it: User',
                6: 'stopWords: List<String>',
                7: 'commentStore: CommentDatabase'
            }}</Code>
            <P>
                and more.
            </P>
        </EA>
        <h4>Benefits and limitations</h4>
        <P>
            By far the most commonly mentioned benefit of being able to express nullability is type safety—never
            accidentally operating on a <code>null</code> value as though it were non-null, because we know
            which variables are nullable and we get compile-time checks.
        </P>
        <P>
            The other part of the concept is just as important however—the fact that we know exactly which
            variables <em>can never be <code>null</code></em> and we don't have to worry about them!
            This helps with being able to safely and confidently refactor code, even as previously true assumptions change
            over time. It also helps lower the mental load of working with someone else's code, because there are
            just <EL eid={EK.NullRedundantChecks} unimportant>fewer possible paths</EL> we have to consider.
        </P>
        <EA eid={EK.NullRedundantChecks}>
            Compilers and IDEs can even produce warnings if null checks that are no longer necessary
            remain in the code, so they can be safely eliminated.
        </EA>
        <P>
            <EL eid={EK.NullabilityPointlessCheck}>More.</EL>
        </P>
        <EA eid={EK.NullabilityPointlessCheck}>
            <P>
                We also get rid of confusion about where any remaining null handling should go. We may have previously had a function
                that defensively checked its arguments.
            </P>
            <Code language="java">{`
                public void readBook(AudioOutput output, Book book) {
                    if (book == null) {
                        throw IllegalArgumentException("Book can't be null!");
                    }
                    // ...
                }
            `}</Code>
            <P>
                Such a check is ultimately pointless, because by the time someone calls the function with a <code>null</code> argument,
                it is too late to do anything meaningful about it. The problem lies either at the site where <code>readBook</code> is
                called from, or even before that. What we really need is to stop that incorrect call from occurring in the first place.
            </P>
            <P>
                TODO: expand, not completely pointless because it can express the error a little more clearly,
                and possibly serve as early warning in cases where we wouldn't access any properties, but at
                the end of the day it still should be expressed via the static type
            </P>
            <P>
                If we can express optionality explicitly, we can clearly separate the parts of the code that can deal
                with not having books from the parts that can't. We will then only put checks at the boundary
                between these two parts, where the compiler requires them anyway.
            </P>
            <Code language="scala">{`
                // The \`Option\` clearly shows the fact that some users don't have
                // a favorite book.
                def getFavoriteBook(user: User): Option[Book] = {
                  // ...
                }

                // \`readBook\` requires a \`Book\` instance, and never worries about
                // it not being present. This contract is enforced at compile-time.
                def readBook(output: AudioOutput, book: Book): Unit = {
                  // ...
                }

                ✂
                val 👉book👈1 = getFavoriteBook(👉user👈2)

                // This is a compile-time error, readBook requires \`Book\`,
                // but we only have an \`Option[Book]\`.
                // Seeing this error will make us aware that we need to handle that case.
                readBook(👉output👈3, 💀book💀4)

                ✂
                // We handle the "no book" case by displaying a status message in UI.
                👉book👈1 match {
                  case Some(👉b👈5) => readBook(👉output👈3, 👉b👈5)
                  case None => ui.showStatus("User doesn't have a favorite book")
                }

                // Another commonly used solution is to use a "default" fallback
                // value, if one makes sense.
            `}{{
                1: 'book: Option[Book]',
                2: 'user: User',
                3: 'output: AudioOutput',
                4: 'Type mismatch, expected: 🔧Book🔧, actual: 🔧Option[Book]🔧.',
                5: 'b: Book'
            }}</Code>
        </EA>
        <P>
            This feature is far from a magic bullet though. Most non-trivial statically typed code still relies
            on at least a few assumptions, which cannot be easily (todo link) expressed in its language's type system,
            and thus won't be checked at compile-time. <EL eid={EK.NullabilityLimitations}>More.</EL>
        </P>
        <EA eid={EK.NullabilityLimitations}>
            <Anchor aid={AnchorKey.NullabilityLimitations}>
            <P>
                A very common one comes into play when working with collections—lists, maps, etc. Retrieving an item
                from a list using its index (e.g. <code>players[3]</code>), or from a map by its key (e.g. <code>players[playerName]</code>)
                would intuitively result in a value with a nullable type—after all, what if there aren't enough players in that
                list to reach a <code>3</code> index? What if whatever value <code>playerName</code> contains is not an existing
                key in our map?
            </P>
            <P>
                If these situations can really, realistically occur in our program, then the type being nullable is correct,
                and we should handle such a case. For example Kotlin's main map/list retrieval methods and the <code>[]</code> operator
                have nullable return types.
            </P>
            <P>
                Our program could however be structured in a way where, at some point in the code, there will <em>always</em> be
                a particular entry in a map. We may want to just count on that fact, and do away with the check.
                This is of course possible—we can assert that a value will exist, with the caveat that the code will cause
                an error if our expectation was not met.
            </P>
            <P>
                Imagine an application where the users can design their own forms, and other users then
                fill those forms with data. Part of the form validation code could look similar to this:
            </P>
            <Code language="kotlin">{`
                // Hover over variables to see their types.

                val 👉formData👈4 = 👉formUI👈9.👉collectData👈14()

                // The validator is part of the business logic layer, which knows
                // nothing about the UI, and can be used separately.
                val 👉result👈1 = 👉validator👈2.👉validateForm👈3(👉formData👈4)

                if (👉result👈1 is 👉Invalid👈5) {
                    👉result👈1.👉errors👈6.👉forEach👈7 { 👉error👈8 ->
                        // \`formUI\` contains a widget for every field inside \`formData\`.
                        // We use \`getValue\` (returns a non-nullable type) to assert
                        // this fact, and will get a run-time error if we were wrong.
                        👉formUI👈9.👉widgets👈10.👉getValue👈11(👉error👈8.👉fieldName👈12).👉highlight👈13()
                    }
                }
            `}{{
                1: 'result: ValidationResult',
                2: 'validator: Validator',
                3: 'fun Validator.validateForm(Form): ValidationResult',
                4: 'formData: Form',
                5: 'object Invalid : ValidationResult',
                6: 'errors: List<ValidationError> 🖊in🖊 Invalid',
                7: 'fun List<T>.forEach((T) -> Unit): Unit',
                8: 'error: ValidationError',
                9: 'formUI: FormUI',
                10: 'widgets: Map<String, Widget> 🖊in🖊 FormUI',
                11: 'fun Map<K, V>.getValue(K): V',
                12: 'fieldName: String 🖊in🖊 ValidationError',
                13: 'fun Widget.highlight(): Unit',
                14: 'fun FormUI.collectData(): Form'
            }}</Code>
            <P>
                Here we work with the assumption that the <code>formUI.widgets</code> map will always contain all keys 
                that could possibly appear in the <code>errors</code> list, because of how we previously created
                the map—the form has a widget for every field that exists on it, and we only validate existing fields.
                In most languages, we cannot express and verify such a relationship at compile-time
                without <EL eid={EK.NullPairsValidator}>redesigning</EL> the code.
            </P>
            <EA eid={EK.NullPairsValidator}>
                <P>
                    There are ways to achieve full type safety (without any downcasts or assertions) in the above example,
                    but all of them come with tradeoffs (and when dealing with 3rd party libraries, you often don't
                    have a choice anyway).
                </P>
                <P>
                    We could make the validator (part of the business logic layer, which we don't want to depend
                    on the UI layer) and its errors generic (<code>{'Validator<T>'}</code>, <code>{'ValidationError<T>'}</code>),
                    where the error could refer to any structure (in this case, <code>T</code> would be our <code>Widget</code>),
                    and the validator would just need some way to get the actual field from that structure—we could give it
                    a <code>getField: (T) -> Field</code> lambda, or our widgets could implement some kind
                    of <code>HasField</code> interface. We could then directly retrieve our <code>Widget</code> from
                    the <code>{'ValidationError<Widget>'}</code>.
                </P>
                <PersonalOpinion>
                    <P>
                        However, the additional complexity this would introduce may not be worth it. It may sound
                        trivial on its own, but a system where <em>everything</em> is done this way could soon start to look
                        like those "<ExternalLink href="https://github.com/EnterpriseQualityCoding/FizzBuzzEnterpriseEdition">
                        FizzBuzz Enterprise Edition</ExternalLink>" jokes.
                    </P>
                    <P>
                        Simply "connecting" the fields with the widgets using a string (their name) is good enough in this case.
                    </P>
                </PersonalOpinion>
            </EA>
            <P>
                In a sense, we could say maps are "dynamic" when it comes to what keys they contain.
                In some dynamically typed languages (e.g. JavaScript), <em>all objects</em> act very much like maps.
            </P>
            <P>
                We could decide to be extra safe and handle the case where a key doesn't appear in the map anyway,
                but that would mean we are writing code for a branch that we never expect to run—it will only run
                if future changes break our assumption (which likely means we then have a bug in our code). There may also be no
                good way to continue with the program's execution from such a state (e.g. the user could be stuck editing
                a form that can never be made valid). The tradeoff between overly defensive programming versus too many
                unwritten assumptions is discussed more in its <LinkTo aid={AnchorKey.Defensive}>own chapter</LinkTo>.
            </P>
            <P>
                Another common situation concerns late initialization and lifetime of variables, it is also described
                in its <LinkTo aid={AnchorKey.Initialization}>own chapter</LinkTo>.
            </P>
            </Anchor>
        </EA>
    </EA>