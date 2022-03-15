export interface Versions {
  readonly currentVersion: string
  readonly nextRelease: string
  readonly nextPreMajor: string
  readonly nextMajor: string
  readonly nextPreMinor: string
  readonly nextMinor: string
  readonly nextPrePatch: string
  readonly nextPatch: string
  readonly nextCommitTag: string
  readonly commitNumber: number
}
