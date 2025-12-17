var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/arg@5.0.2/node_modules/arg/index.js
var require_arg = __commonJS({
  "../../node_modules/.pnpm/arg@5.0.2/node_modules/arg/index.js"(exports, module) {
    var flagSymbol = Symbol("arg flag");
    var ArgError = class _ArgError extends Error {
      constructor(msg, code) {
        super(msg);
        this.name = "ArgError";
        this.code = code;
        Object.setPrototypeOf(this, _ArgError.prototype);
      }
    };
    function arg2(opts, {
      argv = process.argv.slice(2),
      permissive = false,
      stopAtPositional = false
    } = {}) {
      if (!opts) {
        throw new ArgError(
          "argument specification object is required",
          "ARG_CONFIG_NO_SPEC"
        );
      }
      const result = { _: [] };
      const aliases = {};
      const handlers = {};
      for (const key of Object.keys(opts)) {
        if (!key) {
          throw new ArgError(
            "argument key cannot be an empty string",
            "ARG_CONFIG_EMPTY_KEY"
          );
        }
        if (key[0] !== "-") {
          throw new ArgError(
            `argument key must start with '-' but found: '${key}'`,
            "ARG_CONFIG_NONOPT_KEY"
          );
        }
        if (key.length === 1) {
          throw new ArgError(
            `argument key must have a name; singular '-' keys are not allowed: ${key}`,
            "ARG_CONFIG_NONAME_KEY"
          );
        }
        if (typeof opts[key] === "string") {
          aliases[key] = opts[key];
          continue;
        }
        let type = opts[key];
        let isFlag = false;
        if (Array.isArray(type) && type.length === 1 && typeof type[0] === "function") {
          const [fn] = type;
          type = (value, name, prev = []) => {
            prev.push(fn(value, name, prev[prev.length - 1]));
            return prev;
          };
          isFlag = fn === Boolean || fn[flagSymbol] === true;
        } else if (typeof type === "function") {
          isFlag = type === Boolean || type[flagSymbol] === true;
        } else {
          throw new ArgError(
            `type missing or not a function or valid array type: ${key}`,
            "ARG_CONFIG_VAD_TYPE"
          );
        }
        if (key[1] !== "-" && key.length > 2) {
          throw new ArgError(
            `short argument keys (with a single hyphen) must have only one character: ${key}`,
            "ARG_CONFIG_SHORTOPT_TOOLONG"
          );
        }
        handlers[key] = [type, isFlag];
      }
      for (let i = 0, len = argv.length; i < len; i++) {
        const wholeArg = argv[i];
        if (stopAtPositional && result._.length > 0) {
          result._ = result._.concat(argv.slice(i));
          break;
        }
        if (wholeArg === "--") {
          result._ = result._.concat(argv.slice(i + 1));
          break;
        }
        if (wholeArg.length > 1 && wholeArg[0] === "-") {
          const separatedArguments = wholeArg[1] === "-" || wholeArg.length === 2 ? [wholeArg] : wholeArg.slice(1).split("").map((a) => `-${a}`);
          for (let j = 0; j < separatedArguments.length; j++) {
            const arg3 = separatedArguments[j];
            const [originalArgName, argStr] = arg3[1] === "-" ? arg3.split(/=(.*)/, 2) : [arg3, void 0];
            let argName = originalArgName;
            while (argName in aliases) {
              argName = aliases[argName];
            }
            if (!(argName in handlers)) {
              if (permissive) {
                result._.push(arg3);
                continue;
              } else {
                throw new ArgError(
                  `unknown or unexpected option: ${originalArgName}`,
                  "ARG_UNKNOWN_OPTION"
                );
              }
            }
            const [type, isFlag] = handlers[argName];
            if (!isFlag && j + 1 < separatedArguments.length) {
              throw new ArgError(
                `option requires argument (but was followed by another short argument): ${originalArgName}`,
                "ARG_MISSING_REQUIRED_SHORTARG"
              );
            }
            if (isFlag) {
              result[argName] = type(true, argName, result[argName]);
            } else if (argStr === void 0) {
              if (argv.length < i + 2 || argv[i + 1].length > 1 && argv[i + 1][0] === "-" && !(argv[i + 1].match(/^-?\d*(\.(?=\d))?\d*$/) && (type === Number || // eslint-disable-next-line no-undef
              typeof BigInt !== "undefined" && type === BigInt))) {
                const extended = originalArgName === argName ? "" : ` (alias for ${argName})`;
                throw new ArgError(
                  `option requires argument: ${originalArgName}${extended}`,
                  "ARG_MISSING_REQUIRED_LONGARG"
                );
              }
              result[argName] = type(argv[i + 1], argName, result[argName]);
              ++i;
            } else {
              result[argName] = type(argStr, argName, result[argName]);
            }
          }
        } else {
          result._.push(wholeArg);
        }
      }
      return result;
    }
    arg2.flag = (fn) => {
      fn[flagSymbol] = true;
      return fn;
    };
    arg2.COUNT = arg2.flag((v, name, existingCount) => (existingCount || 0) + 1);
    arg2.ArgError = ArgError;
    module.exports = arg2;
  }
});

// src/actions/context.ts
var import_arg = __toESM(require_arg(), 1);
import { pathToFileURL } from "node:url";
import { prompt } from "@astrojs/cli-kit";
import detectPackageManager from "preferred-pm";
async function getContext(argv) {
  const flags = (0, import_arg.default)(
    {
      "--dry-run": Boolean,
      "--help": Boolean,
      "-h": "--help"
    },
    { argv, permissive: true }
  );
  const packageManager = (await detectPackageManager(process.cwd()))?.name ?? "npm";
  const {
    _: [version = "latest"] = [],
    "--help": help2 = false,
    "--dry-run": dryRun
  } = flags;
  return {
    help: help2,
    prompt,
    packageManager,
    packages: [],
    cwd: new URL(pathToFileURL(process.cwd()) + "/"),
    dryRun,
    version,
    exit(code) {
      process.exit(code);
    }
  };
}

// src/messages.ts
import { color, label, spinner as load } from "@astrojs/cli-kit";
import { align } from "@astrojs/cli-kit/utils";
import detectPackageManager2 from "preferred-pm";
import terminalLink from "terminal-link";

// src/shell.ts
import { spawn } from "node:child_process";
import { text as textFromStream } from "node:stream/consumers";
var text = (stream) => stream ? textFromStream(stream).then((t) => t.trimEnd()) : "";
var signal;
async function shell(command, flags, opts = {}) {
  let child;
  let stdout2 = "";
  let stderr = "";
  if (!signal) {
    const controller = new AbortController();
    process.once("beforeexit", () => controller.abort());
    process.once("exit", () => controller.abort());
    signal = controller.signal;
  }
  try {
    child = spawn(command, flags, {
      cwd: opts.cwd,
      shell: true,
      stdio: opts.stdio,
      timeout: opts.timeout,
      signal
    });
    const done2 = new Promise((resolve) => child.on("close", resolve));
    [stdout2, stderr] = await Promise.all([text(child.stdout), text(child.stderr)]);
    await done2;
  } catch {
    throw { stdout: stdout2, stderr, exitCode: 1 };
  }
  const { exitCode } = child;
  if (exitCode === null) {
    throw new Error("Timeout");
  }
  if (exitCode !== 0) {
    throw new Error(stderr);
  }
  return { stdout: stdout2, stderr, exitCode };
}

// src/messages.ts
var _registry;
async function getRegistry() {
  if (_registry) return _registry;
  const fallback = "https://registry.npmjs.org";
  const packageManager = (await detectPackageManager2(process.cwd()))?.name || "npm";
  try {
    const { stdout: stdout2 } = await shell(packageManager, ["config", "get", "registry"]);
    _registry = stdout2?.trim()?.replace(/\/$/, "") || fallback;
    if (!new URL(_registry).host) _registry = fallback;
  } catch {
    _registry = fallback;
  }
  return _registry;
}
var stdout = process.stdout;
function setStdout(writable) {
  stdout = writable;
}
async function spinner(args) {
  await load(args, { stdout });
}
function pluralize(word, n) {
  const [singular, plural] = Array.isArray(word) ? word : [word, word + "s"];
  if (n === 1) return singular;
  return plural;
}
var celebrations = [
  "Beautiful.",
  "Excellent!",
  "Sweet!",
  "Nice!",
  "Huzzah!",
  "Success.",
  "Nice.",
  "Wonderful.",
  "Lovely!",
  "Lookin' good.",
  "Awesome."
];
var done = [
  "You're on the latest and greatest.",
  "Your integrations are up-to-date.",
  "Everything is current.",
  "Everything is up to date.",
  "Integrations are all up to date.",
  "Everything is on the latest and greatest.",
  "Integrations are up to date."
];
var bye = [
  "Thanks for using Astro!",
  "Have fun building!",
  "Take it easy, astronaut!",
  "Can't wait to see what you build.",
  "Good luck out there.",
  "See you around, astronaut."
];
var log = (message) => stdout.write(message + "\n");
var newline = () => stdout.write("\n");
var banner = async () => log(
  `
${label("astro", color.bgGreen, color.black)}  ${color.bold(
    "Integration upgrade in progress."
  )}`
);
var bannerAbort = () => log(`
${label("astro", color.bgRed)} ${color.bold("Integration upgrade aborted.")}`);
var warn = async (prefix, text2) => {
  log(`${label(prefix, color.bgCyan, color.black)}  ${text2}`);
};
var info = async (prefix, text2, version = "") => {
  const length = 11 + prefix.length + text2.length + version?.length;
  const symbol = "\u25FC";
  if (length > stdout.columns) {
    log(`${" ".repeat(5)} ${color.cyan(symbol)}  ${prefix}`);
    log(`${" ".repeat(9)}${color.dim(text2)} ${color.reset(version)}`);
  } else {
    log(
      `${" ".repeat(5)} ${color.cyan(symbol)}  ${prefix} ${color.dim(text2)} ${color.reset(version)}`
    );
  }
};
var upgrade = async (packageInfo, text2) => {
  const { name, isMajor = false, targetVersion } = packageInfo;
  const bg = isMajor ? (v) => color.bgYellow(color.black(` ${v} `)) : color.green;
  const style = isMajor ? color.yellow : color.green;
  const symbol = isMajor ? "\u25B2" : "\u25CF";
  const toVersion = targetVersion.replace(/^\D+/, "");
  const version = `v${toVersion}`;
  const length = 12 + name.length + text2.length + version.length;
  if (length > stdout.columns) {
    log(`${" ".repeat(5)} ${style(symbol)}  ${name}`);
    log(`${" ".repeat(9)}${color.dim(text2)} ${bg(version)}`);
  } else {
    log(`${" ".repeat(5)} ${style(symbol)}  ${name} ${color.dim(text2)} ${bg(version)}`);
  }
};
var title = (text2) => align(label(text2, color.bgYellow, color.black), "end", 7) + " ";
var success = async (prefix, text2) => {
  const length = 10 + prefix.length + text2.length;
  if (length > stdout.columns) {
    log(`${" ".repeat(5)} ${color.green("\u2714")}  ${prefix}`);
    log(`${" ".repeat(9)}${color.dim(text2)}`);
  } else {
    log(`${" ".repeat(5)} ${color.green("\u2714")}  ${prefix} ${color.dim(text2)}`);
  }
};
var error = async (prefix, text2) => {
  if (stdout.columns < 80) {
    log(`${" ".repeat(5)} ${color.red("\u25B2")}  ${color.red(prefix)}`);
    log(`${" ".repeat(9)}${color.dim(text2)}`);
  } else {
    log(`${" ".repeat(5)} ${color.red("\u25B2")}  ${color.red(prefix)} ${color.dim(text2)}`);
  }
};
var changelog = async (name, text2, url) => {
  const link = terminalLink(text2, url, { fallback: () => url });
  const linkLength = terminalLink.isSupported ? text2.length : url.length;
  const symbol = " ";
  const length = 12 + name.length + linkLength;
  if (length > stdout.columns) {
    log(`${" ".repeat(5)} ${symbol}  ${name}`);
    log(`${" ".repeat(9)}${color.cyan(color.underline(link))}`);
  } else {
    log(`${" ".repeat(5)} ${symbol}  ${name} ${color.cyan(color.underline(link))}`);
  }
};
function printHelp({
  commandName,
  usage,
  tables,
  description
}) {
  const linebreak = () => "";
  const table = (rows, { padding }) => {
    const split = stdout.columns < 60;
    let raw = "";
    for (const row of rows) {
      if (split) {
        raw += `    ${row[0]}
    `;
      } else {
        raw += `${`${row[0]}`.padStart(padding)}`;
      }
      raw += "  " + color.dim(row[1]) + "\n";
    }
    return raw.slice(0, -1);
  };
  let message = [];
  if (usage) {
    message.push(linebreak(), `${color.green(commandName)} ${color.bold(usage)}`);
  }
  if (tables) {
    let calculateTablePadding2 = function(rows) {
      return rows.reduce((val, [first]) => Math.max(val, first.length), 0);
    };
    var calculateTablePadding = calculateTablePadding2;
    const tableEntries = Object.entries(tables);
    const padding = Math.max(...tableEntries.map(([, rows]) => calculateTablePadding2(rows)));
    for (const [, tableRows] of tableEntries) {
      message.push(linebreak(), table(tableRows, { padding }));
    }
  }
  if (description) {
    message.push(linebreak(), `${description}`);
  }
  log(message.join("\n") + "\n");
}

// src/actions/help.ts
function help() {
  printHelp({
    commandName: "@astrojs/upgrade",
    usage: "[version] [...flags]",
    headline: "Upgrade Astro dependencies.",
    tables: {
      Flags: [
        ["--help (-h)", "See all available flags."],
        ["--dry-run", "Walk through steps without executing."]
      ]
    }
  });
}

// src/actions/install.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { color as color2, say } from "@astrojs/cli-kit";
import { random, sleep } from "@astrojs/cli-kit/utils";
async function install(ctx) {
  await banner();
  newline();
  const { current, dependencies, devDependencies } = filterPackages(ctx);
  const toInstall = [...dependencies, ...devDependencies].sort(sortPackages);
  for (const packageInfo of current.sort(sortPackages)) {
    const tag = /^\d/.test(packageInfo.targetVersion) ? packageInfo.targetVersion : packageInfo.targetVersion.slice(1);
    await info(`${packageInfo.name}`, `is up to date on`, `v${tag}`);
    await sleep(random(50, 150));
  }
  if (toInstall.length === 0 && !ctx.dryRun) {
    newline();
    await success(random(celebrations), random(done));
    return;
  }
  const majors = [];
  for (const packageInfo of toInstall) {
    const word = ctx.dryRun ? "can" : "will";
    await upgrade(packageInfo, `${word} be updated to`);
    if (packageInfo.isMajor) {
      majors.push(packageInfo);
    }
  }
  if (majors.length > 0) {
    const { proceed } = await ctx.prompt({
      name: "proceed",
      type: "confirm",
      label: title("wait"),
      message: `${pluralize(
        ["One package has", "Some packages have"],
        majors.length
      )} breaking changes. Continue?`,
      initial: true
    });
    if (!proceed) {
      return ctx.exit(0);
    }
    newline();
    await warn("check", `Be sure to follow the ${pluralize("CHANGELOG", majors.length)}.`);
    for (const pkg of majors.sort(sortPackages)) {
      await changelog(pkg.name, pkg.changelogTitle, pkg.changelogURL);
    }
  }
  newline();
  if (ctx.dryRun) {
    await info("--dry-run", `Skipping dependency installation`);
  } else {
    await runInstallCommand(ctx, dependencies, devDependencies);
  }
}
function filterPackages(ctx) {
  const current = [];
  const dependencies = [];
  const devDependencies = [];
  for (const packageInfo of ctx.packages) {
    const { currentVersion, targetVersion, isDevDependency } = packageInfo;
    if (currentVersion.replace(/^\D+/, "") === targetVersion) {
      current.push(packageInfo);
    } else {
      const arr = isDevDependency ? devDependencies : dependencies;
      arr.push(packageInfo);
    }
  }
  return { current, dependencies, devDependencies };
}
function sortPackages(a, b) {
  if (a.isMajor && !b.isMajor) return 1;
  if (b.isMajor && !a.isMajor) return -1;
  if (a.name === "astro") return -1;
  if (b.name === "astro") return 1;
  if (a.name.startsWith("@astrojs") && !b.name.startsWith("@astrojs")) return -1;
  if (b.name.startsWith("@astrojs") && !a.name.startsWith("@astrojs")) return 1;
  return a.name.localeCompare(b.name);
}
async function runInstallCommand(ctx, dependencies, devDependencies) {
  const cwd = fileURLToPath(ctx.cwd);
  if (ctx.packageManager === "yarn") await ensureYarnLock({ cwd });
  const installCmd = ctx.packageManager === "yarn" || ctx.packageManager === "pnpm" ? "add" : "install";
  await spinner({
    start: `Installing dependencies with ${ctx.packageManager}...`,
    end: `Installed dependencies!`,
    while: async () => {
      try {
        if (dependencies.length > 0) {
          await shell(
            ctx.packageManager,
            [
              installCmd,
              ...dependencies.map(
                ({ name, targetVersion }) => `${name}@${targetVersion.replace(/^\^/, "")}`
              )
            ],
            { cwd, timeout: 9e4, stdio: "ignore" }
          );
        }
        if (devDependencies.length > 0) {
          await shell(
            ctx.packageManager,
            [
              installCmd,
              "--save-dev",
              ...devDependencies.map(
                ({ name, targetVersion }) => `${name}@${targetVersion.replace(/^\^/, "")}`
              )
            ],
            { cwd, timeout: 9e4, stdio: "ignore" }
          );
        }
      } catch {
        const packages = [...dependencies, ...devDependencies].map(({ name, targetVersion }) => `${name}@${targetVersion}`).join(" ");
        newline();
        error(
          "error",
          `Dependencies failed to install, please run the following command manually:
${color2.bold(
            `${ctx.packageManager} ${installCmd} ${packages}`
          )}`
        );
        return ctx.exit(1);
      }
    }
  });
  await say([`${random(celebrations)} ${random(done)}`, random(bye)], { clear: false });
}
async function ensureYarnLock({ cwd }) {
  const yarnLock = path.join(cwd, "yarn.lock");
  if (fs.existsSync(yarnLock)) return;
  return fs.promises.writeFile(yarnLock, "", { encoding: "utf-8" });
}

// src/actions/verify.ts
import dns from "node:dns/promises";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { color as color3 } from "@astrojs/cli-kit";
import semverCoerce from "semver/functions/coerce.js";
import semverDiff from "semver/functions/diff.js";
import semverParse from "semver/functions/parse.js";
async function verify(ctx) {
  const registry = await getRegistry();
  if (!ctx.dryRun) {
    const online = await isOnline(registry);
    if (!online) {
      bannerAbort();
      newline();
      error("error", `Unable to connect to the internet.`);
      ctx.exit(1);
    }
  }
  await verifyAstroProject(ctx);
  const ok = await verifyVersions(ctx, registry);
  if (!ok) {
    bannerAbort();
    newline();
    error("error", `Version ${color3.reset(ctx.version)} ${color3.dim("could not be found!")}`);
    await info("check", "https://github.com/withastro/astro/releases");
    ctx.exit(1);
  }
}
function isOnline(registry) {
  const { host } = new URL(registry);
  return dns.lookup(host).then(
    () => true,
    () => false
  );
}
function safeJSONParse(value) {
  try {
    return JSON.parse(value);
  } catch {
  }
  return {};
}
async function verifyAstroProject(ctx) {
  const packageJson = new URL("./package.json", ctx.cwd);
  if (!existsSync(packageJson)) return false;
  const contents = await readFile(packageJson, { encoding: "utf-8" });
  if (!contents.includes("astro")) return false;
  const { dependencies = {}, devDependencies = {} } = safeJSONParse(contents);
  if (dependencies["astro"] === void 0 && devDependencies["astro"] === void 0) return false;
  collectPackageInfo(ctx, dependencies, devDependencies);
  return true;
}
function isAstroPackage(name, _version) {
  return name === "astro" || name.startsWith("@astrojs/");
}
function isAllowedPackage(name, _version) {
  return name !== "@astrojs/upgrade";
}
function isValidVersion(_name, version) {
  return semverCoerce(version, { loose: true }) !== null;
}
function isSupportedPackage(name, version) {
  for (const validator of [isAstroPackage, isAllowedPackage, isValidVersion]) {
    if (!validator(name, version)) return false;
  }
  return true;
}
function collectPackageInfo(ctx, dependencies = {}, devDependencies = {}) {
  for (const [name, currentVersion] of Object.entries(dependencies)) {
    if (!isSupportedPackage(name, currentVersion)) continue;
    ctx.packages.push({
      name,
      currentVersion,
      targetVersion: ctx.version
    });
  }
  for (const [name, currentVersion] of Object.entries(devDependencies)) {
    if (!isSupportedPackage(name, currentVersion)) continue;
    ctx.packages.push({
      name,
      currentVersion,
      targetVersion: ctx.version,
      isDevDependency: true
    });
  }
}
async function verifyVersions(ctx, registry) {
  const tasks = [];
  for (const packageInfo of ctx.packages) {
    tasks.push(resolveTargetVersion(packageInfo, registry));
  }
  try {
    await Promise.all(tasks);
  } catch {
    return false;
  }
  for (const packageInfo of ctx.packages) {
    if (!packageInfo.targetVersion) {
      return false;
    }
  }
  return true;
}
async function resolveTargetVersion(packageInfo, registry) {
  const packageMetadata = await fetch(`${registry}/${packageInfo.name}`, {
    headers: { accept: "application/vnd.npm.install-v1+json" }
  });
  if (packageMetadata.status >= 400) {
    throw new Error(`Unable to resolve "${packageInfo.name}"`);
  }
  const { "dist-tags": distTags } = await packageMetadata.json();
  let version = distTags[packageInfo.targetVersion];
  if (version) {
    packageInfo.tag = packageInfo.targetVersion;
    packageInfo.targetVersion = version;
  } else {
    packageInfo.targetVersion = "latest";
    version = distTags.latest;
  }
  if (packageInfo.currentVersion === version) {
    return;
  }
  const prefix = packageInfo.targetVersion === "latest" ? "^" : "";
  packageInfo.targetVersion = `${prefix}${version}`;
  const fromVersion = semverCoerce(packageInfo.currentVersion);
  const toVersion = semverParse(version);
  const bump = semverDiff(fromVersion, toVersion);
  if (bump === "major" && toVersion.prerelease.length === 0 || bump === "premajor") {
    packageInfo.isMajor = true;
    if (packageInfo.name === "astro") {
      const upgradeGuide = `https://docs.astro.build/en/guides/upgrade-to/v${toVersion.major}/`;
      const docsRes = await fetch(upgradeGuide);
      if (docsRes.status === 200) {
        packageInfo.changelogURL = upgradeGuide;
        packageInfo.changelogTitle = `Upgrade to Astro v${toVersion.major}`;
        return;
      }
    }
    const latestMetadata = await fetch(`${registry}/${packageInfo.name}/latest`);
    if (latestMetadata.status >= 400) {
      throw new Error(`Unable to resolve "${packageInfo.name}"`);
    }
    const { repository } = await latestMetadata.json();
    const branch = bump === "premajor" ? "next" : "main";
    packageInfo.changelogURL = extractChangelogURLFromRepository(repository, version, branch);
    packageInfo.changelogTitle = "CHANGELOG";
  } else {
    packageInfo.tag = void 0;
  }
}
function extractChangelogURLFromRepository(repository, version, branch = "main") {
  return repository.url.replace("git+", "").replace(".git", "") + `/blob/${branch}/` + repository.directory + "/CHANGELOG.md#" + version.replace(/\./g, "");
}

// src/index.ts
var exit = () => process.exit(0);
process.on("SIGINT", exit);
process.on("SIGTERM", exit);
async function main() {
  const cleanArgv = process.argv.slice(2).filter((arg2) => arg2 !== "--");
  const ctx = await getContext(cleanArgv);
  if (ctx.help) {
    help();
    return;
  }
  const steps = [verify, install];
  for (const step of steps) {
    await step(ctx);
  }
  process.exit(0);
}
export {
  collectPackageInfo,
  getContext,
  install,
  main,
  setStdout,
  verify
};
