import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

const check = process.argv.includes("--check")
const sync = process.argv.includes("--sync")
const lockPath = "package-lock.json"
const inventoryPath = "src/generated/licenses.json"
const bundlePath = "public/third-party-notices.txt"
const markdownPath = "LICENSES.md"
const lock = JSON.parse(readFileSync(lockPath, "utf8"))
const manifest = JSON.parse(readFileSync("package.json", "utf8"))
const shadcn = JSON.parse(readFileSync("notices/vendor/shadcn-ui.json", "utf8"))
const assetsPath = "notices/vendor/assets.json"
const assets = JSON.parse(readFileSync(assetsPath, "utf8"))
const sha256 = value => createHash("sha256").update(value).digest("hex")
const noticePattern = /^(licen[cs]e|copying|notice|copyright|ofl)(?:[._-]|$)/i
const readText = path => readFileSync(path, "utf8").replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim()
const candidateAsset = /\.(?:avif|gif|ico|jpe?g|mp3|mp4|ogg|otf|png|svg|ttf|webm|webp|woff2?)$/i
function filesIn(directory) {
  return existsSync(directory)
    ? readdirSync(directory, { recursive: true, withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => join(file.parentPath, file.name))
    : []
}
const assetFiles = [
  ...filesIn("public").filter(file => file !== bundlePath),
  ...filesIn("src").filter(file => candidateAsset.test(file)),
]
const localInputs = [...new Set([
  "scripts/licenses.mjs", "package.json", lockPath, "notices/vendor/shadcn-ui.json", "notices/vendor/shadcn-ui.txt",
  assetsPath, ...filesIn("notices/upstream"), ...assets.map(asset => asset.notice),
  ...readdirSync("src/components/ui").map(file => `src/components/ui/${file}`),
  ...assetFiles,
])].sort()
const inputHash = sha256(localInputs.map(path => `${path}:${sha256(readFileSync(path))}`).join("\n"))

function line(value) {
  return value.replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ")
}

function markdown(inventory) {
  return [
    "# Third-party licences",
    "",
    "This inventory covers browser assets, application dependencies and build and test tools. The [complete notices](public/third-party-notices.txt) include copyright notices, licence terms and bundled Next.js notices. The same inventory appears at `/licenses`.",
    "",
    "Run `npm run licenses:update` after changing dependencies or third-party assets. `npm run licenses:check` and the production build reject stale records. Review the generated differences, including new licences and distribution obligations.",
    "",
    "## Bundled assets and copied source",
    "",
    "| Material | Version or source | Licence |",
    "| --- | --- | --- |",
    ...inventory.featured.map(item => `| ${line(item.name)} | [${line(item.version)}](${item.source}) | ${line(item.licence)} |`),
    "",
    "shadcn/ui uses the official New York registry. The [component manifest](notices/vendor/shadcn-ui.json) records the source and SHA-256 of each retrieved registry item. Lucide’s notice includes the Feather MIT attribution. Geist Sans is served from this application’s origin. Additional repository assets are recorded in the [asset manifest](notices/vendor/assets.json).",
    "",
    "## Package inventory",
    "",
    "| Package | Version | Licence | Scope |",
    "| --- | --- | --- | --- |",
    ...inventory.packages.map(item => `| [${line(item.name)}](${item.source}) | ${line(item.version)} | ${line(item.licence)} | ${line(item.scope)} |`),
    "",
    "Platform-specific optional packages are listed from the lockfile. Sharp and libvips are optional server packages for Next.js image optimisation, which this app does not use. If distributing a server image that includes these binaries, review platform-specific bundled notices and corresponding-source and relinking obligations before distribution.",
    "",
  ].join("\n")
}

function synchronised() {
  try {
    const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"))
    return inventory.inputHash === inputHash && inventory.bundleHash === sha256(readFileSync(bundlePath)) &&
      readFileSync(markdownPath, "utf8") === markdown(inventory)
  } catch {
    return false
  }
}

if ((check || sync) && synchronised()) {
  console.log("Third-party notices are synchronised.")
} else if (check) {
  console.error("Third-party notices are missing or stale. Review dependency and asset changes, then run npm run licenses:update.")
  process.exitCode = 1
} else {
  const declaredUi = new Set(shadcn.map(item => item.file))
  const declaredAssets = new Set(assets.map(asset => asset.file))
  for (const file of localInputs) {
    if (file.startsWith("src/components/ui/") && !declaredUi.has(file)) throw new Error(`Record the source and licence of ${file}.`)
    if (assetFiles.includes(file) && !declaredAssets.has(file)) throw new Error(`Record the provenance and licence of ${file} in ${assetsPath}.`)
  }
  for (const file of declaredUi) {
    if (!existsSync(file)) throw new Error(`Remove the stale source entry for ${file}.`)
  }

  for (const asset of assets) {
    if (!assetFiles.includes(asset.file) || !asset.name || !asset.licence || !asset.version || new URL(asset.source).protocol !== "https:") {
      throw new Error(`Review the asset inventory entry for ${asset.file}.`)
    }
  }

  const allowed = new Set(["MIT", "ISC", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD", "BlueOak-1.0.0", "MPL-2.0", "LGPL-3.0-or-later"])
  function licenceFor(name, licence) {
    if (name === "geist" && licence === "SIL OPEN FONT LICENSE") return "OFL-1.1"
    if (name === "caniuse-lite" && licence === "CC-BY-4.0") return licence
    const parts = licence?.split(" AND ")
    if (!parts?.every(part => allowed.has(part))) throw new Error(`Review the licence of ${name}: ${licence ?? "missing"}`)
    return licence
  }

  const packages = []
  const references = []
  const texts = new Map()
  function addNotices(item, notices) {
    const ids = notices.map(([name, text]) => {
      const id = sha256(text).slice(0, 12)
      if (!texts.has(id)) texts.set(id, text)
      return `${name} [${id}]`
    })
    references.push(`${item}\n${ids.join("\n")}`)
  }
  const packageTexts = new Map()

  function packageNotices(path, name, meta) {
    if (existsSync(path)) {
      const names = readdirSync(path, { withFileTypes: true }).filter(file => file.isFile() && noticePattern.test(file.name))
      if (names.length) return names.sort((a, b) => a.name.localeCompare(b.name)).map(file => [file.name, readText(join(path, file.name))])
    }
    const oxideOptional = name.startsWith("@tailwindcss/oxide-")
    if (name === "@next/env" || name.startsWith("@next/swc-")) return [["Next.js licence", readText("node_modules/next/license.md")]]
    if (oxideOptional) return [["Tailwind CSS Oxide licence", readText("node_modules/@tailwindcss/oxide/LICENSE")]]
    if (name.startsWith("lightningcss-")) return [["Lightning CSS licence", readText("node_modules/lightningcss/LICENSE")]]
    if (name.startsWith("@img/sharp")) {
      const notices = [["Sharp packaging licence", readText(meta.license.includes("LGPL") ? "notices/upstream/sharp-libvips.txt" : "node_modules/sharp/LICENSE")]]
      if (meta.license.includes("LGPL")) {
        notices.push(["LGPL-3.0", readText("notices/upstream/lgpl-3.0.txt")], ["GPL-3.0", readText("notices/upstream/gpl-3.0.txt")])
        notices.push(["Corresponding source and platform notices", "https://github.com/lovell/sharp-libvips/releases and https://github.com/libvips/libvips/releases"])
      }
      return notices
    }
    const overrides = {
      "client-only": "client-only",
      "react-remove-scroll-bar": "react-remove-scroll-bar",
      "@napi-rs/wasm-runtime": "napi-rs-wasm-runtime",
      "@tybys/wasm-util": "tybys-wasm-util",
      "@emnapi/core": "emnapi",
      "@emnapi/runtime": "emnapi",
      "@emnapi/wasi-threads": "emnapi",
    }
    if (name in overrides && Object.hasOwn(overrides, name)) return [["Upstream licence", readText(`notices/upstream/${overrides[name]}.txt`)]]
    throw new Error(`No reviewed notice for ${name}@${meta.version}.`)
  }

  for (const [path, meta] of Object.entries(lock.packages)) {
    if (!path) continue
    const name = path.split("node_modules/").at(-1)
    const source = `https://www.npmjs.com/package/${name}/v/${meta.version}`
    const licence = licenceFor(name, meta.license)
    const scope = meta.optional ? "Platform optional" : meta.dev ? "Build or test" :
      Object.hasOwn(manifest.dependencies, name) ? "Application" : "Application dependency"
    packages.push({ name, version: meta.version, source, licence, scope })
    const notices = packageNotices(path, name, meta)
    packageTexts.set(name, notices[0][1])
    addNotices(`${name}@${meta.version} · ${licence} · ${scope}\n${source}`, notices)
  }

  const nextCompiled = "node_modules/next/dist/compiled"
  for (const file of readdirSync(nextCompiled, { recursive: true, withFileTypes: true })) {
    if (!file.isFile() || !noticePattern.test(file.name)) continue
    const path = join(file.parentPath, file.name)
    addNotices(`Bundled by Next.js · ${path.slice(nextCompiled.length + 1)}`, [[file.name, readText(path)]])
  }

  const shadcnText = readText("notices/vendor/shadcn-ui.txt")
  addNotices("shadcn/ui · official New York registry components\nhttps://github.com/shadcn-ui/ui", [["MIT", shadcnText]])
  const extra = assets.map(({ name, source, version, licence, notice }) => ({ name, source, version, licence, text: readText(notice) }))
  for (const asset of extra) addNotices(`${asset.name} · ${asset.licence}\n${asset.source}`, [[asset.licence, asset.text]])
  const separator = "\n\n" + "=".repeat(70) + "\n\n"
  const bundle = [
    "Money Manager · Third-party notices\n\nEach package and asset lists the IDs of its complete text below.",
    ...references,
    ...Array.from(texts, ([id, text]) => `[${id}]\n\n${text}`),
  ].join(separator) + "\n"
  const packageVersion = name => lock.packages[`node_modules/${name}`].version
  const featured = [
    { name: "shadcn/ui", version: "Official New York registry", source: "https://github.com/shadcn-ui/ui", licence: "MIT", text: shadcnText },
    { name: "Geist Sans", version: packageVersion("geist"), source: "https://github.com/vercel/geist-font", licence: "OFL-1.1", text: packageTexts.get("geist") },
    { name: "Lucide and Feather icons", version: packageVersion("lucide-react"), source: "https://github.com/lucide-icons/lucide", licence: "ISC and MIT", text: packageTexts.get("lucide-react") },
    ...extra,
  ]
  const inventory = { inputHash, bundleHash: sha256(bundle), featured, packages: packages.sort((a, b) => a.name.localeCompare(b.name)) }
  for (const [path, content] of [[inventoryPath, JSON.stringify(inventory, null, 2) + "\n"], [bundlePath, bundle], [markdownPath, markdown(inventory)]]) {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
  console.log(`Wrote notices for ${packages.length} package entries and ${featured.length} featured items.`)
}
