import { createApp } from "vue"
import App from "./App.vue"
import router from "./src/router"
import { createPinia } from "pinia"
import "./src/styles/index.css"

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount("#app")
