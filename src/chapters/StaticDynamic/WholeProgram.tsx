import * as React from 'react'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import Code from 'ui/Code'
import { LinkTo, AnchorKey, Anchor } from 'ui/Anchor'
import { P } from 'ui/Structure'

export default () =>
    <Anchor aid={AnchorKey.WholeProgram} useParent={true}>
        <h3>Whole program correctness</h3>
        <P>
            In statically typed languages, the <em>whole program</em> <EL eid={EK.StaticCorrect} unimportant>has to</EL> be correct (in terms of the type system)
            in order to compile and/or run.
            <EA eid={EK.StaticCorrect}>
                (TypeScript <em>can</em> emit code even when there are type errors, because the resulting JS doesn't
                rely on the type information at run-time in any way. This is however a pretty rare exception
                - most languages are not like that. People usually consider a program with build errors as unusable anyway.)
                See the chapter about <LinkTo aid={AnchorKey.Implementation}>implementation concerns</LinkTo> for more details.
            </EA>
        </P>
        <P>
            With dynamic typing, <em>only the branches that actually run</em> will be affected by type errors.
            Similarly, only data that's actually used at run-time can cause type errors.
        </P>
        <P>
            <EL eid={EK.ExampleBranches} example>Example</EL>
        </P>
        <EA eid={EK.ExampleBranches}>
            <P>
                The simplest way to showcase this is probably with a piece of extremely contrived code like this:
                <Code language="groovy">{`
                    // Groovy by default uses dynamic typing
                    if (random() < 0.5) {
                        print pow(5, 6)
                    }else{
                        print pow("wrong", "type")
                    }
                `}</Code>
            </P>
            <P>
                About half the time, the program will complete successfully, and the other
                half, it will fail due to a type error - depending on which branch ends up
                being evaluated. As long as the program doesn't visit the <EL eid={EK.BranchesBad} unimportant>"bad"</EL> one, everything
                will work fine.
            </P>
            <EA eid={EK.BranchesBad}>
                <P>
                    Other kinds of issues that would be compile errors in static languages, will work in the same way.
                    This includes calling a non-existent function (e.g. due to a typo), accessing a non-existent variable,
                    or calling a function with the wrong number of arguments.
                </P>
                <P>This makes sense when you think about how all of these things are only resolved at run-time in dynamic languages.</P>
                <P>Many editors can catch a subset of such mistakes even in dynamically typed languages. (TODO link)</P>
            </EA>
            <P>
                The same program in Java simply won't compile, because <em>all</em> of the branches must be correct:
                <Code language="java">{`
                    if (random() < 0.5) {
                        out.print(pow(5, 6));
                    }else{
                        out.print(pow(💀"wrong", "type"💀1));
                    }
                `}{{1: 'Incompatible types: 🔧String🔧 cannot be converted to 🔧double🔧'}}</Code>
            </P>
            <P>
                However, such code is obviously completely ridiculous. I have a few more realistic examples.
            </P>
            <P>
                <EL eid={EK.DynamicModificationPitfalls} example>Pitfalls when modifying existing code</EL>
            </P>
            <EA eid={EK.DynamicModificationPitfalls}>
                <P>
                    You have a system for buying train tickets. The user can search trains based on
                    the stations and times. There is a feature where the user can print the search results
                    (outputs a PDF). In the first version of the system, the user had to input a specific
                    station directly (maybe via auto-complete search input).
                </P>
                <Code language="python">{`
                    def perform_search(db, search_request):
                        origin = db.load_station(search_request.origin.station_id)
                        # ... the actual search logic would be here
                        return SearchResults.create_from(data)


                    def render_html_results(search_request, results):
                        """Shows both the original search request, and the search results."""
                        station_name = search_request.origin.name
                        for train in results.trains:
                            # ...

                    ✂
                    def print_search_results(search_request, results):
                        # ...
                        if search_request.origin.has_luggage_lockers:
                            document.add_icon(icon_coordinates, lockers_symbol)

                        for train in results.trains
                            # ...

                    ✂
                    results = search.perform_search(db, request)
                    print_search_results(request, results)
                `}</Code>
                <P>
                    Everything works just fine. But later, you also allow the user to
                    enter a city instead of a specific station, in order to search within
                    all stations in that city.
                </P>
                <P>
                    This means that <code>origin</code> in <code>SearchResults</code> won't always
                    be a single station. It can now also refer to a city. In some languages, its
                    type would now be written as <code>Station|City</code>. In others, these
                    would be two subclasses of the same base class.
                </P>
                <P>
                    So you make adjustmensts to <code>perform_search</code>, and to <code>render_html_results</code>,
                    the latter now looks like this:
                </P>
                <Code language="python">{`
                    def render_html_results(search_request, results):
                        origin_name = search_request.origin.name
                        if isinstance(search_request.origin, Station):
                            # Show some station-specific info...
                        # ...
                `}</Code>
                <P>
                    But if <code>print_search_results</code> is a rarely-used function in a different file,
                    you might forget to update it to account for this new possibility. Then the following
                    line might cause an error:
                </P>
                <Code language="python">{`
                    # There is no \`has_luggage_lockers\` property on \`City\`,
                    # only on \`Station\`.
                    if search_request.origin.has_luggage_lockers:
                `}</Code>
                <P>
                    From a brief test of the UI however, everything might seem fine. If you try
                    searching for a city, it will work. If you search for a station and print the results,
                    that will work as well. It's only when you get to the combination of both searching
                    for a city, and trying to print the results, that the error will be discovered.
                </P>
                <P>
                    Even tests might potentially miss this case, if you only test <code>print_search_results</code> with
                    a <code>Station</code>.
                </P>
                <P>
                    With static typing, you would be forced to handle all possibilities everywhere.
                </P>
                <Code language="typescript">{`
                    interface SearchRequest {
                        origin: Station|City
                        // ...
                    }

                    ✂
                    function printSearchResults(
                        request: SearchRequest,
                        results: SearchResults
                    ): HttpResponse {
                        // ...
                        if (request.origin.💀hasLuggageLockers💀1) {
                            // ...
                        }
                    }
                `}{{
                    1: 'Property 🔧hasLuggageLockers🔧 does not exist on type 🔧Station|City🔧.\n >> Property 🔧hasLuggageLockers🔧 does not exist on type 🔧City🔧.'
                }}</Code>
                <P>
                    However, if the language you use is not <LinkTo aid={AnchorKey.Expresiveness}>expressive</LinkTo> enough,
                    you may sometimes need to use types which don't accurately describe the data. If your variables have types that 
                    are <LinkTo aid={AnchorKey.WiderNarrower}>wider</LinkTo> than what the variable represents, you may still have
                    to rely on many <LinkTo aid={AnchorKey.Defensive}>unwritten assumptions</LinkTo>.
                </P>
            </EA>
            <P>
                <EL eid={EK.StaticPrototyping} example>Unnecessary changes during prototyping</EL>
            </P>
            <EA eid={EK.StaticPrototyping}>
                <P>
                    Having to make <em>all of the code</em> correct all the time can be a nuisance, when all you need
                    is to try out a temporary change, that you will very likely soon revert anyway.
                    You may have an existing codebase of a drawing program, where all coordinates use millimeters
                    as their unit.
                </P>
                <P>
                    But you may want to quickly prototype a way to allow the user to use more than one kind of units
                    (including units whose size depends on the device, such as pixels), and combine them together
                    in the same drawing. You also want to keep the information about which units were used where,
                    when the drawings are saved and later reopened.
                </P>
                <Code language="kotlin">{`
                    // Before
                    data class Point(val x: Double, val y: Double)
                    data class Line(val start: Point, val end: Point)

                    ✂
                    // After (admittedly this is not the greatest design, but it'll do)
                    data class Value(val n: Double, val unit: ValueUnit)

                    // We'll keep the old \`Point\` class as is, and use this new one
                    // instead, to minimze the amount of code we need to change before
                    // the project compiles again. We can have the IDE rename it later.
                    data class PointNew(val x: Value, val y: Value) {
                        fun mm(metrics: Metrics) = Point(metrics.mm(x), metrics.mm(y))
                    }

                    data class Line(val start: PointNew, val end: PointNew)

                    interface Metrics {
                        fun mm(value: Value): Double
                    }
                `}</Code>
                <P>
                    Initially, you only care about rendering lines, to try out the new design, see how the UI
                    would need to be changed, etc. Porting of the rest of the codebase can wait.
                </P>
                <Code language="kotlin">{`
                class Renderer(val metrics: Metrics) {
                    fun renderLine(line: Line) {
                        val startMm = line.start.mm(metrics)
                        val endMm = line.end.mm(metrics)
                        // ...
                    }

                    // ...
                }
                `}</Code>
                <P>
                    However, even if you try to isolate the temporary changes as much as possible,
                    there may be parts of the existing code which you don't care about right now, but which rely on the
                    old <code>Line</code> structure with the millimeter-only coordinates.
                </P>
                <P>
                    In a statically typed language, you will either need to adapt those parts too, or at the very least
                    comment out their code and replace it with a "TODO" exception, or return some kind of "empty" value.
                </P>
                <Code language="kotlin">{`
                fun breakIntoLines(circle: Circle, minStepAngle: Double): List<Line> {
                    // We won't be needing this function any time soon, not until
                    // we have the final design for values with arbitrary units.
                    // We still need to edit it though for the project to compile.
                    TODO()
                }
                `}</Code>
                <P>
                    In a dynamically typed language, you don't have to worry about such things until later.
                    You can keep the parts you don't care about temporarily incorrect, and only focus on the part
                    you're designing. Then, once you have found a design you're satisfied with, you will implement it
                    for real, ideally with tests included.
                </P>
            </EA>
        </EA>
    </Anchor>

    /*


    issue:

    - real project would use a templating engine for html,
    so the example is bad
    

    */