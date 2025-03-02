import { bangs } from "./bang";
import "./global.css";

const debug = true;

const logger = {
  log: (...args: any[]) => {
    if (debug) console.log(...args);
  },
  error: (...args: any[]) => {
    if (debug) console.error(...args);
  },
}

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1 class="title">Hao's Search</h1>
        <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
        <div class="url-container"> 
          <input 
            type="text" 
            class="url-input"
            value="https://search.hao.dev?q=%s"
            readonly 
          />
          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
        <p>If you would like to override the default bang, you can do so by adding the "d" parameter. For example, to use Google as the default bang, you can do:</p>
        <div class="url-container"> 
          <input 
            type="text" 
            class="url-input"
            value="https://search.hao.dev?d=g&q=%s"
            readonly 
          />
          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
      </div>
      <footer class="footer">
        <a href="https://github.com/h-dong/search-engine-redirect" target="_blank">Github</a>
      </footer>
    </div>
  `;

  const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>(".url-input")!;

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });
}

function getBangredirectUrl({url, defaultBangString}: {url: URL, defaultBangString?: string}) {
  const defaultBang = bangs.find((b) => b.t === defaultBangString);

  if (defaultBangString) {
    logger.log('Default bang based on default bang string:', defaultBang);
  }

  const query = url.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    logger.error("Error: No search query parameter");
    return null;
  }

  // Match both !bang and bang! formats
  const prefixMatch = query.match(/!(\S+)/i);
  const suffixMatch = query.match(/(\S+)!/);

  const bangCandidate = (prefixMatch?.[1] ?? suffixMatch?.[1])?.toLowerCase();
  const selectedBang = bangs.find((b) => b.t === bangCandidate) ?? defaultBang;

  // Remove bangs in query
  const cleanQuery = query
    .replaceAll(/!\S+\s*/i, "") // Remove prefix bangs
    .replaceAll(/\s*\S+!/, "") // Remove suffix bangs
    .trim();

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/")
  );

  return searchUrl ?? null;
}

function doRedirect() {
  logger.log("Starting redirect...");
  
  const url = new URL(window.location.href);

  if (!url.searchParams.get("q")) {
    logger.error("Error: URL missing search query parameter");

    noSearchDefaultPageRender();
    return;
  }

  const defaultBangString = url.searchParams.get("d")?.trim();
  const hasBangInSearchTerm = url.searchParams.get("q")?.includes("!");

  if (!defaultBangString && !hasBangInSearchTerm) {
    logger.log("No default bang and no bang in search term, redirecting to duckduckgo");

    const searchUrl = `https://duckduckgo.com/?q=${url.searchParams.get("q")}`;

    logger.log("Redirecting to", searchUrl);

    window.location.replace(searchUrl);
  }

  logger.log("Bang detected...");

  const searchUrl = getBangredirectUrl({
    url,
    defaultBangString
  });

  if (!searchUrl) {
    logger.error("Error: Invalid search URL");

    noSearchDefaultPageRender();
    return;
  }

  logger.log("Redirecting to", searchUrl);

  window.location.replace(searchUrl);
}

doRedirect();
