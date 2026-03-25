import { docs } from "@/.source/server";
import { loader } from "fumadocs-core/source";

export const source = loader({
  baseUrl: "/grades-tracker/docs",
  source: docs.toFumadocsSource(),
});
