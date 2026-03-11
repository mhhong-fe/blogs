import DefaultTheme from "vitepress/theme";
import "./index.css";
import BookTOC from "../components/BookTOC.vue";
import CatalogTree from "../components/CatalogTree.vue";

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component("BookTOC", BookTOC);
    app.component("CatalogTree", CatalogTree);
  },
};
