export interface Versions {
  readonly currentVersion: string
  readonly nextRelease: string
  readonly nextMinor: string
  readonly nextPatch: string
  readonly nextCommitTag: string
  readonly commitNumber: number
}
