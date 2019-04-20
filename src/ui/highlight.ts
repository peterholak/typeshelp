export function highlight(element: HTMLElement|null) {
    if (element === null) return

    element.classList.remove('highlight')
    const listener = (e: Event) => {
        element.classList.remove('highlight')
        element.removeEventListener(e.type, listener)
    }
    element.addEventListener('animationend', listener)
    element.classList.add('highlight')
}

export default highlight
