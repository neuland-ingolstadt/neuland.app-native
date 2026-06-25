import type { PackageLicenses } from '@/types/licenses'

import packageLicenses from './package-licenses.json'

export type { LicenseEntry, PackageLicenses } from '@/types/licenses'

const licenses = packageLicenses as PackageLicenses

export default licenses
