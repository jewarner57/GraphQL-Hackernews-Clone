import { makeSchema } from "nexus";
import { join } from "path";
import * as types from "../src/graphql";   // 1

export const schema = makeSchema({
  types,   // 2
  outputs: {
    typegen: join(__dirname, "..", "nexus-typegen.ts"),
    schema: join(__dirname, "..", "schema.graphql"),
  },
});
