import { createRouter, createWebHistory } from "vue-router";
import PredictionView from "../views/PredictionView.vue";
import TakePictureView from "../views/TakePictureView.vue";
import HistoryView from "../views/HistoryView.vue";

const routes = [
  { path: "/prediction", name: "Prediction", component: PredictionView },
  { path: "/takePicture", name: "TakePicture", component: TakePictureView },
  { path: "/history", name: "History", component: HistoryView },
  { path: "/:pathMatch(.*)*", redirect: "/prediction" },
];

const router = createRouter({
  history: createWebHistory("/astenvuesion"),
  routes
})

export default router;