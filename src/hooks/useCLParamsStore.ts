import { type UniversitySportsFieldsFragment } from '@/__generated__/gql/graphql'
import { type CLEvents } from '@/types/neuland-api'
import { create } from 'zustand'

interface CLParamsStore {
    selectedClEvent: CLEvents | undefined
    setSelectedClEvent: (selectedClEvent: CLEvents) => void
    selectedSportsEvent: UniversitySportsFieldsFragment | undefined
    setSelectedSportsEvent: (
        selectedSportsEvent: UniversitySportsFieldsFragment
    ) => void
}

const useCLParamsStore = create<CLParamsStore>((set) => ({
    selectedClEvent: undefined,
    setSelectedClEvent: (selectedClEvent: CLEvents) => {
        set({ selectedClEvent })
    },
    selectedSportsEvent: undefined,
    setSelectedSportsEvent: (
        selectedSportsEvent: UniversitySportsFieldsFragment
    ) => {
        set({ selectedSportsEvent })
    },
}))

export default useCLParamsStore
