import * as React from 'react'
import { ThemedStyle, mix, Theme, Themed, mixWithTheme, ThemeData } from 'Styles'
import { CommentClient, CommentType, CommentPayload, commentTypes } from 'network/CommentClient'
import Overlay from './Overlay'
import { colors } from './colors'

interface CommentButtonData {
    title: string
    emoji: string
    color?: string
    darkColor?: string
}

function commentButtonData(type: CommentType): CommentButtonData {
    switch (type) {
        case CommentType.DontUnderstand:
            return { title: 'I don\'t fully understand this', emoji: '🎓', color: '#ffffaa' }

        case CommentType.NotCorrect:
            return { title: 'This is not correct', emoji: '⚠', color: '#ffaaaa' }

        case CommentType.OmitsImportantPoint:
            return { title: 'An important point is missing', emoji: '🕳', color: '#ffdddd' }

        case CommentType.Great:
            return { title: 'This is great', emoji: '👍', color: '#aaffaa' }

        case CommentType.NeedlesslyOverexplained:
            return { title: 'Needlessly over-explained', emoji: '💤', color: '#dddddd' }

        case CommentType.Other:
            return { title: 'Other', emoji: '💬', color: undefined }
    }
}

interface ButtonProps {
    theme: ThemeData
    type: CommentType
    onClick?: () => void
    style?: React.CSSProperties
}

function CommentButton(props: ButtonProps) {
    const { title, emoji, color, darkColor } = commentButtonData(props.type)

    const defaultStyle = mixWithTheme(
        props.theme,
        buttonEmojiStyle,
        [color !== undefined, { background: color }],
        [darkColor !== undefined, { dark: { background: darkColor } }]
    )

    return <button
        style={props.style ? { ...defaultStyle, ...props.style } : defaultStyle}
        title={title}
        onClick={props.onClick}
        >
        {`${emoji}\ufe0e`}
    </button>
}

interface ControlProps {
    showOverlay: (commentType: CommentType|undefined) => void
    theme: ThemeData
    pointerType: string|undefined
}

interface ControlState {
    
}


export class CommentControls extends React.Component<ControlProps, ControlState> {

    showUndefinedOverlay = this.props.showOverlay.bind(this, undefined)

    showOverlayByType = commentTypes.map(type => this.props.showOverlay.bind(this, type))

    render() {
        return <div style={{ padding: '10px'}}>
            {this.props.pointerType !== 'touch' ?
                commentTypes.map((type, index) => 
                    <CommentButton key={type} onClick={this.showOverlayByType[index]} type={type} theme={this.props.theme} />
                )
                :
                <button onClick={this.showUndefinedOverlay}>Add feedback</button>
            }
        </div>
    }

}

export enum RequestState {
    NotSent,
    Sending,
    Success,
    Failure
}

interface NetworkHandlerProps {
    children: (
        requstState: RequestState,
        sendComment: (payload: CommentPayload) => void
    ) => React.ReactNode
    commentClient: CommentClient
}

interface NetworkHandlerState {
    requestState: RequestState
}

export class CommentNetworkHandler extends React.Component<NetworkHandlerProps, NetworkHandlerState> {

    state = { requestState: RequestState.NotSent }

    render() {
        return <div>{this.props.children(this.state.requestState, this.sendComment)}</div>
    }

    sendComment = async (payload: CommentPayload) => {
        this.setState({ requestState: RequestState.Sending })
        try {
            await this.props.commentClient.sendComment(payload)
            this.setState({ requestState: RequestState.Success })
        }catch(_) {
            this.setState({ requestState: RequestState.Failure })
        }
    }
}

interface OverlayProps {
    onHide: () => void
    onSendComment: (payload: CommentPayload) => void
    requestState: RequestState
    storedSelection: string,
    initialCommentType: CommentType|undefined
}

interface OverlayState {
    userSelectedType: CommentType|undefined
    writeComment: boolean
    willHide: boolean
}

export class CommentOverlay extends React.Component<OverlayProps, OverlayState> {

    commentInput: HTMLTextAreaElement|null = null
    state = { userSelectedType: undefined, writeComment: false, willHide: false }
    readonly hideDelay = 1000

    selectedType() {
        return this.state.userSelectedType !== undefined ? this.state.userSelectedType : this.props.initialCommentType
    }

    componentDidUpdate(prevProps: OverlayProps, prevState: OverlayState) {
        if (this.commentInput !== null && this.state.writeComment === true && prevState.writeComment === false) {
            this.commentInput.focus()
        }

        if (this.props.requestState === RequestState.Success && prevProps.requestState !== RequestState.Success) {
            this.setState({ willHide: true })
            window.setTimeout(this.props.onHide, this.hideDelay)
        }
    }

    render() {
        const selectedType = this.selectedType()
        const selectedTypeTitle = selectedType !== undefined ?
            commentButtonData(selectedType).title : 
            'Please select a comment type'
            
        return <Themed>{(themed, mixThemed, theme) =>
            <Overlay onHide={this.props.onHide} onShadeClicked={this.onShadeClicked}>
                <div style={themed(topLevelBoxStyle)}>
                    <h1 style={themed(titleStyle)}>Quick feedback</h1>
                    <span style={themed(closeButtonStyle)} onClick={this.props.onHide}>✖{'\ufe0e'}</span>
                    <div style={quoteStyle}>{this.props.storedSelection}</div>
                    <div>
                        {commentTypes.map(type => {
                            return <CommentButton
                                key={type}
                                type={type}
                                theme={theme}
                                onClick={() => this.setState({ userSelectedType: type })}
                                style={this.selectedType() === type ? themed(commentTypeActiveStyle) : undefined}
                                />
                        })}
                        <span style={themed(commentDescriptionStyle)}>{selectedTypeTitle}</span>
                    </div>
                    {!this.state.writeComment &&
                        <div onClick={this.startWritingComment} style={themed(writeCommentStyle)}>+ write comment</div>
                    }
                    {this.state.writeComment &&
                        <div style={themed(commentTextTopLevelStyle)}>
                            <textarea ref={e => this.commentInput = e} style={themed(commentInputStyle)} placeholder="Comment">
                                
                            </textarea>
                            <div style={themed(infoTextStyle)}>
                                Your comment will not be visible yet, but might be in a future update.
                                If you want to publicly discuss this part, open a {' '}
                                <a style={themed(issueLinkStyle)} target="_blank" href="https://github.com/peterholak/typeshelp/issues">github issue</a>.
                            </div>
                        </div>
                    }
                    {this.props.requestState === RequestState.Failure && <span>
                        Saving comment failed
                    </span>}
                    <button
                        style={mixThemed(
                            commentButtonStyle,
                            [!this.sendButtonEnabled(), disabledButtonStyle]
                        )}
                        onClick={this.onSendComment}
                        disabled={!this.sendButtonEnabled()}
                        >
                        {this.sendButtonText()}
                    </button>
                </div>
            </Overlay>
        }</Themed>
    }

    sendButtonEnabled = () =>
        this.props.requestState === RequestState.NotSent || this.props.requestState === RequestState.Failure

    sendButtonText = () => {
        switch (this.props.requestState) {
            case RequestState.NotSent: return "Send"
            case RequestState.Sending: return "Sending..."
            case RequestState.Success: return "Comment saved"
            case RequestState.Failure: return "Send"
        }
    }

    onSendComment = () => {
        const text = this.commentInput ? this.commentInput.value : ''
        const commentType = this.selectedType()

        if (commentType === undefined) return

        this.props.onSendComment({
            text: text,
            quote: this.props.storedSelection,
            type: CommentType[commentType]
        })
    }

    onShadeClicked = () => {
        if (this.commentInput === null || this.commentInput.value === '') {
            this.props.onHide()
        }
    }

    startWritingComment = () => {
        this.setState({ writeComment: true })
    }
}

export default CommentControls

const buttonEmojiStyle: ThemedStyle = {
    display: 'inline-block',
    fontSize: '20px',
    border: '1px solid #888',
    padding: '2px 10px',
    background: '#ccc',
    margin: '0 5px',
    userSelect: 'none',
    cursor: 'pointer',
    borderRadius: '0.5em',
    outlineWidth: 'light',
    outlineColor: '#ddd',
    MozOutlineRadius: '0.5em',

    dark: {
        outlineColor: '#222'
    }
}

const quoteStyle: ThemedStyle = {
    borderLeft: '3px solid #ccc',
    flexGrow: 1,
    flexShrink: 1,
    height: '100%',
    overflow: 'auto',
    fontStyle: 'italic',
    paddingLeft: '1rem',
    marginBottom: '1rem',
    marginLeft: '1rem'
}

const commentInputStyle: ThemedStyle = {
    flexGrow: 1,
    dark: {
        background: '#222',
        color: '#fff'
    }
}
const commentButtonStyle: ThemedStyle = {
    flexGrow: 0,
    flexShrink: 0,
    padding: '0.5rem 1rem',
    alignSelf: 'flex-end',
    background: colors.link,
    color: '#fff',
    border: `1px solid ${colors.darkBoxLines}`
}

const disabledButtonStyle: ThemedStyle = {
    background: '#ccc'
}

const closeButtonStyle: ThemedStyle = {
    position: 'absolute',
    right: '0.5rem',
    top: '0.5rem',
    cursor: 'pointer',
    userSelect: 'none',
    border: `1px solid ${colors.darkBoxLines}`,
    color: '#555',
    padding: '2px 6px'
}

const topLevelBoxStyle: ThemedStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: '0.5rem'
}

const titleStyle: ThemedStyle = {
    fontSize: '1.3rem',
    dark: {
        color: '#ffffff'
    }
}

const commentTypeActiveStyle: ThemedStyle = {
    border: '2px solid #000',
    dark: {
        border: '4px solid #fff'
    }
}

const writeCommentStyle: ThemedStyle = {
    alignSelf: 'center',
    cursor: 'pointer',
    color: colors.link,
    dark: {
        color: colors.link
    }
}

const issueLinkStyle: ThemedStyle = {
    color: colors.link
}

const commentDescriptionStyle: ThemedStyle = {
    display: 'inline-block'
}

const infoTextStyle: ThemedStyle = {
    fontSize: '80%',
    marginBottom: '0.5rem'
}

const commentTextTopLevelStyle: ThemedStyle = {
    flex: '1 1 80%', // TODO flex ratios
    flexDirection: 'column',
    display: 'flex'
}
