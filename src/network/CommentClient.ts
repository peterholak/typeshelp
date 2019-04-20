export interface CommentClient {
    sendComment(payload: CommentPayload): Promise<any>
}

export class CommentNetworkClient implements CommentClient {

    constructor(private rootUrl: string) {}
    
    async sendComment(payload: CommentPayload) {
        return postJson<CommentPayload>(`${this.rootUrl}/sendComment`, payload)
    }

}

export class CommentMockClient implements CommentClient {

    constructor(private rootUrl: string) {}

    async sendComment(payload: CommentPayload): Promise<any> {
        console.log(`mock network request: ${this.rootUrl}`)
        return {}
    }
}

async function postJson<T = {}>(url: string, body: T) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
}

export enum CommentType {
    DontUnderstand,
    NotCorrect,
    OmitsImportantPoint,
    Great,
    NeedlesslyOverexplained,
    Other
}

export const commentTypes: CommentType[] =
    Object
        .entries(CommentType)
        .filter(pair => typeof pair[1] === 'number')
        .map(pair => pair[1])

export interface CommentPayload {
    text: string,
    quote: string,
    type: keyof typeof CommentType | string
}

export default CommentClient
