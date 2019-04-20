import * as React from 'react'
import { P, ChapterTitle } from 'ui/Structure'
import Code from 'ui/Code'
import { ExpanderArea as EA, ExpanderKey as EK, ExpanderLink as EL } from 'ui/Expander'
import { LinkTo, AnchorKey, Anchor } from 'ui/Anchor'

export default () =>
    <div>
        <ChapterTitle>Duck typing</ChapterTitle>
        <P>
            Some dynamically typed languages describe themselves as utilizing something called "duck typing".
        </P>
        <P>
            What they mean is that when coding in them, you should follow the idea
            that <em>you don't care what the concrete type of an object is - you only care that
            it can be used in the way you need</em> - e.g. that it has the property you need to access,
            or that it can be passed into a mathematical function, etc.
        </P>
        <Code language="ruby">{`
            def print_info(book)
                # As long as it responds to \`name\` and \`isbn\`, it's fine...
                puts "#{book.name}, ISBN #{book.isbn}"
            end
        `}</Code>
        <P>
            You should therefore avoid things like
        </P>
        <Code language="ruby">{`
            def print_info(book)
                raise "Must be a book" unless book.is_a? Book
                puts "#{book.name}, ISBN #{book.isbn}"
            end
        `}</Code>
        <P>
            The name comes from the "duck test" phrase:
        </P>
        <blockquote>
            If it looks like a duck, swims like a duck, and quacks like a duck, then it probably is a duck.
        </blockquote>
        <P>
            On the surface, this is somewhat similar to <LinkTo aid={AnchorKey.StructuralNominal}>structural typing</LinkTo>,
            and its idea that as long as the variable has the required structure, it's fine.
        </P>
        <P>
            The difference is that structural typing requires you to specify which properties you will
            be using <em>up front</em>, by describing the structural type, and possibly letting the compiler
            check it at compile-time. With duck typing, you don't specify anything - everything is implied
            by how you use the variable. In other words, there is no explicit schema (TODO link).
        </P>
        <P>
            It is also a little similar to the idea that you should "code to an interface, not an implementation", which
            is a popular piece of advice in many object-oriented languages. But again, most of those languages
            use <LinkTo aid={AnchorKey.StructuralNominal}>nominal typing</LinkTo>, where the link between the interface
            and the implementation is explicit (as is the structure of the interface).
        </P>
        <P>
            Duck typing is an inevitable consequence of how most dynamic languages work, not something
            their authors consciously have to implement. It is more a style of coding, rather than a property of a language,
            although the language must support dynamic types to make it possible to write in this style.
        </P>
        <P>
            <EL eid={EK.DuckMore}>More...</EL>
        </P>
        <EA eid={EK.DuckMore}>
            <P>
                In practice, it means that no explicit type checks will be performed during function calls—e.g.
                the <code>print_info</code> function in the example above will not check the type of its
                argument.
            </P>
            <P>
                Any possible mismatch of types will just manifest itself naturally—e.g. by accessing
                a field that doesn't exist, which will produce an error notifying us that we have a bug in our code
                (or we are running the program with invalid data or configuration, etc.).
            </P>
            <Anchor aid={AnchorKey.ErrorCloseToRootCause}>
            <P>
                In the better cases, any error will manifest itself directly in the function where you
                pass something unexpected, so you will be alerted to it quickly.
            </P>
            <P>
                There are cases however, when you store the object somewhere for future use,
                and only try to interact with it later, at a completely different point in code.
            </P>
            <Code language="ruby">{`
                class Notifications
                    
                    # ...

                    def register_user(user)
                        @users.push(user)
                    end

                    def notify_users
                        @users.each { |u| send_email(u.email) }
                    end
                end

                ✂
                # This is the problem (you're supposed to pass in a \`User\` object, not an id),
                # but the program continues...
                notifications.register_user(user_id)

                ✂
                # Somewhere in another file...
                # This will try to access \`user_id.email\`, which will cause an error.
                notifications.notify_users
            `}</Code>
            <P>
                This particular bug wouldn't be that hard to track down, but in larger programs,
                the data can potentially come from multiple different sources, flow through several layers of code,
                it can be stored in a database, etc.
            </P>
            <P>
                Having automated tests that check if the effects of a particular call are what we expect them to be
                would be more effective at avoiding a bug like this (in this case, whichever function is calling
                <code>notifications.register_user</code> is doing it wrong).
            </P>
            </Anchor>
        </EA>
    </div>