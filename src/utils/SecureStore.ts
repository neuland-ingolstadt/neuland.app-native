// TODO: use encrypted indexDB

export async function getItemAsync(key: string): Promise<string | null> {
    if (
        typeof localStorage === 'undefined' ||
        !(localStorage instanceof Storage)
    )
        return null

    return localStorage[key] ?? null
}

export async function setItemAsync(key: string, value: string): Promise<void> {
    if (
        typeof localStorage === 'undefined' ||
        !(localStorage instanceof Storage)
    )
        return

    localStorage[key] = value
}

export default {
    getItemAsync,
    setItemAsync,
}
