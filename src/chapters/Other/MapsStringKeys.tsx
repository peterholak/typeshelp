import * as React from 'react'
import { Anchor, AnchorKey } from 'ui/Anchor'
import Code from 'ui/Code'
import { P } from 'ui/Structure'

export default () =>
    <Anchor aid={AnchorKey.MapsStringKeys} useParent>
    <P>
        (TODO maybe this whole section should go to the implementation concerns chapter, or schema related stuff, or other section)
        Many dynamically typed languages have a feature where any property can be added/modified
        on any object at run-time.
    </P>
    <Code language="JavaScript" collapsible>{`
        const gameState = JSON.parse(savedGame)
        console.log(\`Loaded a saved game for \${gameState.playerName}\`)

        ✂
        // Supported achievements can be loaded as plugins, and the rest of the code
        // has no knowledge of them.
        function processAllCoinsAchievement(world, gameState) {
            if (gameState.allCoinsAchievement) {
                return
            }

            if (gameState.coins > world.totalCoins) {
                gameState.allCoinsAchievement = { unlockedAt: new Date() }
            }
        }
    `}</Code>
    <P>
        Objects in these languages essentially act like <strong>maps</strong> (also known as dictionaries, associative arrays, etc.)
    </P>
    <P>
        The same thing can be expressed in static languages by a map with string keys. If one part of the
        object always conforms to a pre-defined schema, and another part can be modified in any way, the class
        can be be split into the static part and the dynamic map part.
    </P>
    <Code language="Kotlin" collapsible>{`
        data class GameState(
            // The following 3 fields are the 'static' part that exists on every
            // object, no matter what.
            val playerName: String,
            val position: Position,
            val coins: Int,

            // The map can contain pretty much anything, but there is no way
            // to know the structure at compile-time.
            val achievementData: MutableMap<String, Any>
        )

        ✂
        data class AllCoins(val unlockedAt: Instant)

        // We could just use the string literal "allCoinsAchievement" everywhere
        // directly (just like we do effectively that in dynamic languages),
        // but constants that can be analyzed (find usages), refactored, etc.,
        // tend to be the convention.
        const val ALL_COINS_KEY = "allCoinsAchievement"

        fun processAllCoinsAchievement(world: World, gameState: GameState) {
            if (gameState.achievementData.contains(ALL_COINS_KEY)) {
                return
            }

            if (gameState.coins > world.totalCoins) {
                
                gameState.achievementData[ALL_COINS_KEY] =
                    AllCoins(unlockedAt = Instant.now())
            }
        }
    `}</Code>
    <P>
        By using <code>Any</code> as the value type, we lose a degree of safety and have to manually
        cast the object into the correct type when we want to later read it. This can be looked at
        as having to fall back to dynamic typing for situations that are not representable at compile time.
        Of course we could also design the whole system differently, so that a situation like this
        doesn't occur. (TODO link to something like that, representing state etc.)
    </P>
    <P>
        A similar situation may be wanting to add a "tag" to an object whose structure we don't control.
    </P>
    <Code language="JavaScript">{`
        const video = await videoLoadingLibrary.downloadVideo(filename)
        video._myAppDataSource = 'online'
        return video
    `}</Code>
    <P>
        When faced with such a situation in a statically typed language, we could create a wrapper
        object that contains the original plus our custom information.
    </P>
    <Code language="Kotlin">{`
        class VideoWithSource(val video: Video, val source: VideoSource)

        ✂
        val video = videoLoadingLibrary.downloadVideo(filename)
        return VideoWithSource(video, VideoSource.Online)
    `}</Code>
    <P>
        Then we clearly know which objects are just plain videos (type <code>Video</code> maybe tooltip),
        and which were "enhanced" with our custom information (type <code>VideoWithSource</code>),
        so we can't accidentally mix them up. We also don't have to perform any defensive checks to see
        whether our information is really there (TODO link).
    </P>
    <P>
        We may sometimes need to pass this object to the library again, which will return it to us at a later time.
        However, the library doesn't accept our custom wrapper objects. We could solve this with <strong>inheritance</strong> (tooltip extends),
        but this may not always be an option (the class is final, etc.). Another way to deal with this is to simply store
        this extra data in a separate map, and use the object itself as the key. This is possible
        for any objects that are uniquely identifiable (TODO: link to value types, entities, pointers, etc.).
    </P>
    <Code language="Kotlin" collapsible>{`
        // The key could be a URL, a unique id, or the object itself.
        val videoSources = mutableMapOf<Video, VideoSource>()

        ✂
        val video = videoLoadingLibrary.downloadVideo(filename)

        // We store our custom information for this video separately.
        videoSources[video] = VideoSource.Online

        // Media player doesn't accept our \`VideoWithSource\` wrapper class,
        // just the video directly.
        mediaPlayer.play(video)

        ✂
        // Media player only gives us the currently playing \`Video\` object.
        val video = mediaPlayer.currentlyPlaying()

        // We can use it to retrieve the information we stored earlier.
        val source = videoSources[video]
    `}</Code>
    <P>
        Of course now we have to deal with the possibility that the information for our video may not be
        present in the map, since this can't be guaranteed at compile time.
    </P>
    <P>
        Similarly, if we used inheritance, we would need to perform a typecheck and a downcast on the
        object returned by the media player.
    </P>
    <P>
        In a sense, we are back to the zero guarantees we had with dynamic typing, plus we had to write
        a lot more code to even get this far.
    </P>
    <P>
        On the plus side, the rest of our codebase can clearly differentiate between functions that work
        with just a regular video, and functions that expect our custom data along with it.
        The uncertainty and the checks can be contained in an isolated section.
    </P>
    </Anchor>
