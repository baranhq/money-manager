import { parsePreferences, validateAccounts } from "./backup.ts"
import { accountTypes, defaultPreferences, type AccountType, type LedgerAccount, type Preferences } from "./finance.ts"

export type AccountDraft = { type: AccountType; name: string; balance: string }
export type OnboardingDraft = {
  step: "currency" | "accounts"
  preferences: Preferences
  showPreferences: boolean
  accounts: LedgerAccount[]
  editor: AccountDraft | null
}

export const newAccountDraft: AccountDraft = { type: "Cash", name: "Cash", balance: "" }

export function initialOnboarding(): OnboardingDraft {
  return {
    step: "currency",
    preferences: { ...defaultPreferences, theme: "system" },
    showPreferences: false,
    accounts: [],
    editor: null,
  }
}

export function parseOnboarding(saved: unknown): OnboardingDraft {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) throw new Error("The setup draft is invalid.")
  const row = saved as Record<string, unknown>
  if ((row.step !== "currency" && row.step !== "accounts") || typeof row.showPreferences !== "boolean") {
    throw new Error("The setup draft is invalid.")
  }
  const preferences = parsePreferences(row.preferences)
  let editor: AccountDraft | null = null
  if (row.editor !== null) {
    if (!row.editor || typeof row.editor !== "object" || Array.isArray(row.editor) || row.step !== "accounts") {
      throw new Error("The account draft is invalid.")
    }
    const draft = row.editor as Record<string, unknown>
    const type = accountTypes.find(option => option === draft.type)
    if (!type || typeof draft.name !== "string" || draft.name.length > 70 || typeof draft.balance !== "string" || draft.balance.length > 64) {
      throw new Error("The account draft is invalid.")
    }
    editor = { type, name: draft.name, balance: draft.balance }
  }
  return { step: row.step, preferences, showPreferences: row.showPreferences, accounts: validateAccounts(row.accounts, preferences), editor }
}
