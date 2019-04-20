import * as React from 'react'
import { ThemedStyle, Theme, ThemeData, themedColor, withTheme } from 'Styles'
import colors from 'colors';

export const typeRectSize = { width: 100, height: 50 }
const typeRectPadding = { left: 5, top: 5 }

function x(raw: number) { return typeRectPadding.left + raw * typeRectSize.width }
function y(raw: number) { return typeRectPadding.top + raw * typeRectSize.height }

export function TypeRect(props: { text: string, x: number, y: number, theme: ThemeData }) {
    return <g transform={`translate(${x(props.x)}, ${y(props.y)})`}>
        <rect
            width={`${typeRectSize.width}px`}
            height={`${typeRectSize.height}px`}
            style={withTheme(props.theme, typeRectStyle)}
            />
        <text
            x={`${typeRectSize.width/2}px`}
            y={`${typeRectSize.height/2}px`}
            fontSize={typeRectSize.height / 2.75}
            style={{
                alignmentBaseline: 'middle',
                textAnchor: 'middle',
                fill: themedColor(props.theme, lineColor)
            }}
        >{props.text}</text>
    </g>
}

interface ArrowProps {
    fromX: number
    fromY: number
    toX: number
    toY: number,
    targetOffset?: number,
    theme: ThemeData
}

export function InheritanceArrow(props: ArrowProps) {
    const targetOffset = props.targetOffset || 0.5
    const tipHeight = 20
    const tipWidth = 20
    const tipWidthHalf = tipWidth / 2

    const start = { x: x(props.fromX + 0.5), y: y(props.fromY) }
    const arrowTip = { x: x(props.toX + targetOffset), y: y(props.toY + 1) }

    const width = arrowTip.x - start.x
    const height = arrowTip.y - start.y
    const length = Math.sqrt(width * width + height * height)
    const baseLength = length - tipHeight

    const angleSin = height / length
    const angle = Math.asin(angleSin)

    const sign = (arrowTip.x > start.x ? 1 : -1)

    const baseWidth = Math.cos(angle) * baseLength * sign
    const baseHeight = angleSin * baseLength

    const arrowBase = { x: start.x + baseWidth, y: start.y + baseHeight }

    const angleB = Math.PI / 2 - angle
    const sideHeight = Math.sin(angleB) * tipWidthHalf
    const sideWidth = Math.cos(angleB) * tipWidthHalf * sign

    const arrowSide1 = { x: arrowBase.x + sideWidth, y: arrowBase.y - sideHeight }
    const arrowSide2 = { x: arrowBase.x - sideWidth, y: arrowBase.y + sideHeight }

    const points = [
        start, arrowBase, arrowSide1, arrowTip, arrowSide2, arrowBase
    ].map(point => `${point.x},${point.y}`).join(' ')

    return <polyline
        points={points}
        strokeLinejoin="round"
        stroke={themedColor(props.theme, lineColor)}
        fill={themedColor(props.theme, fillColor)} />
}

type CircleValue = [string, number, number]
interface CircleProps {
    text: string
    x: number
    y: number
    children?: CircleValue[]
}

export function ValueListCircle(props: CircleProps) {
    return <g transform={`translate(${props.x}, ${props.y})`}>
        <circle cx={0} cy={0} r={50} fill="none" stroke="#000" />
        {props.children && props.children.map(value =>
            <text x={value[1]} y={value[2]} key={value[0]} style={{
                alignmentBaseline: 'middle',
                textAnchor: 'middle'
            }}>{value[0]}</text>
        )}
        <text x={0} y={55} style={{
            alignmentBaseline: 'hanging',
            textAnchor: 'middle'
        }}>{props.text}</text>
    </g>
}

const lineColor = {
    light: '#000',
    dark: '#fff'
}

const fillColor = {
    light: '#fff',
    dark: colors.dark.background
}

const typeRectStyle: ThemedStyle = {
    fill: fillColor.light,
    stroke: lineColor.light,
    width: `${typeRectSize.width}px`,
    height: `${typeRectSize.height}px`,

    dark: {
        fill: fillColor.dark,
        stroke: lineColor.dark
    }
}
