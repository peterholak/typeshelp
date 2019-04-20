import * as React from 'react'

export interface ChapterCounter {
    nextChapter: number
}

export const ChapterContext = React.createContext<ChapterCounter>({ nextChapter: 1 })
