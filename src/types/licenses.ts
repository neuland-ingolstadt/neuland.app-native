export interface LicenseEntry {
	licenses: string
	repository?: string
	licenseUrl?: string
	parents: string
}

export type PackageLicenses = Record<string, LicenseEntry>
