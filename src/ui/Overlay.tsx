import * as React from 'react'
import { ThemedStyle, ThemeContext, Themed } from 'Styles'
import { colors } from './colors'

interface OverlayProps {
    onHide: () => void
    onShadeClicked?: () => void
}

class Overlay extends React.Component<OverlayProps, {}> {

    componentDidMount() {
        document.scrollingElement!.classList.add('lock-scrolling')
        document.body.addEventListener('keydown', this.onKeyDown)
    }

    componentWillUnmount() {
        document.scrollingElement!.classList.remove('lock-scrolling')
        document.body.removeEventListener('keydown', this.onKeyDown)
    }

    render() {
        return <Themed>{themed =>
            <div style={themed(overlayStyle)}>
                <div style={themed(overlayShade)} onClick={this.props.onShadeClicked}></div>
                <div style={themed(overlaySpacer)}></div>
                <div style={themed(overlayBox)}>
                    {this.props.children}
                </div>
                <div style={themed(overlaySpacer)}></div>
            </div>
        }</Themed>
    }
    
    onKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode === 27) {
            this.props.onHide()
        }
    }
}

const overlayStyle: ThemedStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    zIndex: 2
}

const overlayShade: ThemedStyle = {
    background: 'black',
    opacity: 0.9,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 3
}

const overlayBox: ThemedStyle = {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: '800px',
    minHeight: '400px',
    width: '100%',
    height: '100%',
    zIndex: 4,
    background: '#fff',
    border: '2px solid #ccc',
    display: 'flex',
    dark: {
        background: '#222',
        border: `1px solid ${colors.darkBoxLines}`
    }
}

// TODO: use grid instead of this crap?
const overlaySpacer: ThemedStyle = {
    flexGrow: 1,
    width: '100%',
    height: '100%'
}

export default Overlay