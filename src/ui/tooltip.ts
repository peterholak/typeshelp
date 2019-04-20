import { processTag, escapeHtml } from 'ui/markup'

interface Options {
    delay: number
    hideDelay: number
}

type NoAction = { type: 'none' }
type ShowHideAction = { type: 'show'|'hide', element: HTMLElement }
type PendingAction = NoAction|ShowHideAction

class Tooltips {
    elements: NodeListOf<HTMLElement>
    tooltip: HTMLDivElement
    options: Options
    pendingAction: PendingAction
    activeElement: HTMLElement|undefined

    constructor(selector: string, options?: Options) {
        this.elements = document.querySelectorAll(selector)
        this.tooltip = this.createTooltip()
        this.options = { ...this.defaultOptions(), ...(options || {}) }

        this.pendingAction = { type: 'none' }
        this.activeElement = undefined

        this.replaceNormalTitles()
        this.attachEvents([ 'mouseover' ], [ 'mouseleave' ])
    }

    defaultOptions(): Options {
        return {
            delay: 300,
            hideDelay: 50
        }
    }

    replaceNormalTitles() {
        this.elements.forEach(e => {
            e.dataset.title = e.getAttribute('title') || undefined
            e.removeAttribute('title')
        })
    }

    attachEvents(activateEvents: string[], deactivateEvents: string[]) {
        activateEvents.forEach(event => {
            this.elements.forEach(element => {
                element.addEventListener(event, e => this.activated(element))
            })
        })

        deactivateEvents.forEach(event => {
            this.elements.forEach(element => {
                element.addEventListener(event, e => this.deactivated(element))
            })
        })
    }

    activated(element: HTMLElement) {
        if (this.tooltipVisible()) {
            this.showTooltip(element)
            this.pendingAction = { type: 'none' }
            return
        }

        this.pendingAction = { type: 'show', element }

        window.setTimeout(() => {
            if (this.pendingAction.type !== 'show' || this.pendingAction.element !== element) return

            this.showTooltip(element)
        }, this.options.delay)
    }

    deactivated(element: HTMLElement) {
        this.pendingAction = { type: 'hide', element }

        window.setTimeout(() => {
            if (this.pendingAction.type !== 'hide' || this.pendingAction.element !== element) return

            this.hideTooltip()
        }, this.options.hideDelay)
    }

    tooltipMouseover(_: MouseEvent) {
        this.pendingAction = { type: 'none' }
    }

    tooltipMouseout(_: MouseEvent) {
        if (this.activeElement === undefined) {
            return this.hideTooltip()
        }
        this.deactivated(this.activeElement)
    }

    createTooltip() {
        const tooltip = document.createElement('div')
        tooltip.style.position = 'fixed'
        tooltip.style.zIndex = '3'
        tooltip.style.display = 'none'
        tooltip.classList.add('tooltip')
        document.body.appendChild(tooltip)
        tooltip.addEventListener('mouseover', e => this.tooltipMouseover(e))
        tooltip.addEventListener('mouseout', e => this.tooltipMouseout(e))
        return tooltip
    }

    showTooltip(element: HTMLElement) {
        this.tooltip.style.display = 'block'
        this.tooltip.classList.toggle('codetip', element.dataset.codetip !== undefined)
        this.tooltip.innerHTML = this.processMarkup(element.dataset.title!)
        
        const rect = element.getBoundingClientRect()
        this.tooltip.style.bottom = `${Math.floor(window.innerHeight - rect.top)}px`
        this.tooltip.style.left = `${Math.floor(rect.left)}px`
        this.activeElement = element
    }

    hideTooltip() {
        this.tooltip.style.display = 'none'
        this.activeElement = undefined
    }

    tooltipVisible() {
        return this.tooltip.style.display !== 'none'
    }

    processMarkup(title: string): string {
        let code = escapeHtml(title)

        code = processTag({
            code,
            open: '🔧',
            close: '🔧',
            references: {},
            startTag: () => '<code>',
            endTag: () => '</code>'
        })

        code = processTag({
            code,
            open: '🖊',
            close: '🖊',
            references: {},
            startTag: () => '<em>',
            endTag: () => '</em>'
        })

        code = code.replace(/\n/g, '<br />')

        return code
    }
}

export default Tooltips
