import { fetchOrgConfig, identifyUser, setBaseUrl, setIdentityToken, OrgConfig } from "./api";
import { injectStyles } from "./styles";
import { createFeedbackWidget } from "./feedback";
import { createChangelogWidget } from "./changelog";
import { createRoadmapWidget } from "./roadmap";
import { createLauncher } from "./launcher";

// Command queue pattern — works even when loaded async
// Host app calls window.Freebase('cmd', args) before script loads
// Those calls are queued and replayed once SDK is ready

type Command = [string, ...unknown[]];

interface FreebaseStatic {
  (...args: Command): void;
  q?: Command[];
}

declare global {
  interface Window {
    Freebase?: FreebaseStatic;
  }
}

interface InitOptions {
  org: string;
  theme?: "light" | "dark" | "auto";
  position?: "bottom-right" | "bottom-left";
  accentColor?: string;
}

interface IdentifyOptions {
  userId: string;
  email: string;
  name?: string;
  jwt: string;
}

interface WidgetHandles {
  feedback: ReturnType<typeof createFeedbackWidget> | null;
  changelog: ReturnType<typeof createChangelogWidget> | null;
  roadmap: ReturnType<typeof createRoadmapWidget> | null;
}

let initialized = false;
let orgConfig: OrgConfig | null = null;
let appUrl = "";
let widgetPosition: "bottom-right" | "bottom-left" = "bottom-right";
const handles: WidgetHandles = { feedback: null, changelog: null, roadmap: null };
let launcher: ReturnType<typeof createLauncher> | null = null;

async function cmdInit(options: InitOptions) {
  if (initialized) return;
  initialized = true;

  const { org, theme = "auto", position = "bottom-right", accentColor } = options;
  widgetPosition = position;

  // Derive base URL from the script src — works for both hosted and self-hosted
  const scriptEl = document.currentScript as HTMLScriptElement | null;
  const scriptSrc = scriptEl?.src ?? "";
  try {
    const url = new URL(scriptSrc);
    appUrl = url.origin;
  } catch {
    appUrl = window.location.origin;
  }

  setBaseUrl(appUrl);

  // Fetch org config (name, accentColor, categories)
  const config = await fetchOrgConfig(org);
  if (!config) {
    console.warn("[Freebase] Could not load org config for:", org);
    return;
  }

  orgConfig = config;
  const resolvedAccent = accentColor ?? config.accentColor ?? "#10b981";

  // Inject CSS
  injectStyles(resolvedAccent);

  // Apply theme attribute to root
  if (theme !== "auto") {
    document.documentElement.setAttribute("data-fb-theme", theme);
  }

  // Create all 3 surfaces — each gets a closeOthers callback so opening
  // one surface automatically closes the other two
  function closeOthers(except: "feedback" | "changelog" | "roadmap") {
    if (except !== "feedback") handles.feedback?.close();
    if (except !== "changelog") handles.changelog?.close();
    if (except !== "roadmap") handles.roadmap?.close();
  }

  handles.feedback = createFeedbackWidget(config, position, appUrl, () => closeOthers("feedback"));
  handles.changelog = createChangelogWidget(
    config,
    position,
    appUrl,
    () => closeOthers("changelog"),
    (count) => launcher?.setUnreadCount(count)
  );
  handles.roadmap = createRoadmapWidget(config, position, appUrl, () => closeOthers("roadmap"));

  // Collapse behind a single launcher — clicking it fans out the 3 surface buttons
  launcher = createLauncher(position);
  launcher.addSurfaceButton(handles.feedback.getButton());
  launcher.addSurfaceButton(handles.changelog.getButton());
  launcher.addSurfaceButton(handles.roadmap.getButton());
}

async function cmdIdentify(options: IdentifyOptions) {
  if (!orgConfig) return;

  const result = await identifyUser(orgConfig.slug, options.jwt);
  if (result?.token) {
    setIdentityToken(result.token);
  } else {
    // Fall back to storing JWT directly for API header attachment
    setIdentityToken(options.jwt);
  }
}

function cmdOpen(surface: "feedback" | "changelog" | "roadmap") {
  if (surface === "feedback") handles.feedback?.open();
  if (surface === "changelog") handles.changelog?.open();
  if (surface === "roadmap") handles.roadmap?.open();
}

function cmdGetUnreadCount(cb: (count: number) => void) {
  if (handles.changelog) {
    cb(handles.changelog.getUnreadCount());
  } else {
    cb(0);
  }
}

async function dispatch(cmd: string, ...args: unknown[]) {
  switch (cmd) {
    case "init":
      await cmdInit(args[0] as InitOptions);
      break;
    case "identify":
      await cmdIdentify(args[0] as IdentifyOptions);
      break;
    case "open":
      cmdOpen(args[0] as "feedback" | "changelog" | "roadmap");
      break;
    case "getUnreadCount":
      cmdGetUnreadCount(args[0] as (count: number) => void);
      break;
    default:
      console.warn("[Freebase] Unknown command:", cmd);
  }
}

// Drain the pre-load queue, then replace the stub
function boot() {
  const existing = window.Freebase;
  const queue: Command[] = existing?.q ?? [];

  // New callable
  const fb: FreebaseStatic = (...args: Command) => {
    void dispatch(args[0], ...args.slice(1));
  };

  window.Freebase = fb;

  // Replay queued commands in order
  for (const args of queue) {
    void dispatch(args[0], ...args.slice(1));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
