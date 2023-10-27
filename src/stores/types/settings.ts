// this
export interface Card {
    key: string
    text: string
    removable: boolean
    default: string[]
    card: () => JSX.Element
}

//
export interface CardDisplayed extends Card {
    isHidden: boolean
}

export interface CardPersisted {
    isHidden: boolean
    key: string
}
