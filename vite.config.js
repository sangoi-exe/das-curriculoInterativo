import { fileURLToPath, URL } from "node:url"
import { defineConfig, loadEnv, Plugin } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"

// Plugin  para coletar logs no console do servidor
function clientLoggerPlugin() {
  return {
    name: "vite-plugin-client-logger",
    configureServer(server) {
      server.middlewares.use("/__client_logs", (req, res, next) => {
        if (req.method === "POST") {
          let body = ""
          req.on("data", (chunk) => {
            body += chunk
          })
          req.on("end", () => {
            try {
              const logData = JSON.parse(body)
              const { type, args } = logData
              console.log(`[Client ${type}]`, ...args)
            } catch (err) {
              console.error("[Client Logger] Erro ao parsear logs do cliente:", err)
            }
            res.statusCode = 204
            res.end()
          })
        } else {
          next()
        }
      })
    },
    transformIndexHtml(html) {
      return html.replace(
        /<\/head>/,
        `<script>
          (function() {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            const originalDebug = console.debug;
            function sendLog(type, args) {
              try {
                fetch('/__client_logs', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type, args })
                }).catch(() => {});
              } catch (e) {}
            }
            console.log = function(...args) {
              sendLog('log', args);
              originalLog.apply(console, args);
            };
            console.error = function(...args) {
              sendLog('error', args);
              originalError.apply(console, args);
            };
            console.warn = function(...args) {
              sendLog('warn', args);
              originalWarn.apply(console, args);
            };
            console.debug = function(...args) {
              sendLog('debug', args);
              originalDebug.apply(console, args);
            };
          })();
        </script></head>`
      )
    }
  }
}

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return defineConfig({
    plugins: [vue(), vueJsx(), clientLoggerPlugin()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    },
    server: {
      open: true,
      port: Number(env.VITE_PORT) || 5173
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        input: {
          main: "./index.html",
        }
      }
    },
    define: {
      "import.meta.env": process.env
    }
  })
}
