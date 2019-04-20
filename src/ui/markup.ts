interface ProcessTagArgs {
    code: string
    open: string
    close: string
    references: {[index: number]: string}
    startTag: (reference: string|undefined) => string
    endTag: (reference: string|undefined) => string
}

export function processTag(args: ProcessTagArgs): string {
    let code = args.code
    const openLen = args.open.length, closeLen = args.close.length

    while(true) {
        const blockStart = code.indexOf(args.open, 0)
        if (blockStart === -1) {
            break
        }
        const blockEnd = code.indexOf(args.close, blockStart + openLen)
        const referenceId = findReferenceId(code, blockEnd, closeLen)
        const reference = (referenceId === undefined ? undefined : args.references[referenceId])
        code =
            code.substring(0, blockStart) +
            args.startTag(reference) +
            code.substring(blockStart + openLen, blockEnd) +
            args.endTag(reference) +
            code.substring(blockEnd + closeLen + (referenceId === undefined ? 0 : referenceId.toString().length))
    }

    return code
}

function findReferenceId(code: string, endIndex: number, endLength: number): number|undefined {
    const numberAfter = parseInt(code.substring(endIndex + endLength))
    return isNaN(numberAfter) ? undefined : numberAfter
}

export function escapeHtml(code: string): string {
    return code
        .replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
}
