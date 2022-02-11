import { NexusGenObjects } from "../../nexus-typegen";  
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";   

export const Link = objectType({
  name: "Link", // 1 
  definition(t) {  // 2
    t.nonNull.int("id"); // 3 
    t.nonNull.string("description"); // 4
    t.nonNull.string("url"); // 5 
  },
});

let links: NexusGenObjects["Link"][] = [   // 1
  {
    id: 1,
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
  {
    id: 2,
    url: "graphql.org",
    description: "GraphQL official website",
  },
];

export const LinkQuery = extendType({  // 2
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {   // 3
      type: "Link",
      resolve(parent, args, context, info) {    // 4
        return links;
      },
    });
  },
});

export const LinkIdQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("link", {
      type: "Link",
      args: {
        id: nonNull(intArg())
      },
      resolve(parent, args, context, info) {
        const {id} = args
        const link = links.find(obj => obj.id === id) || null

        return link;
      },
    });
  },
});

export const LinkMutation = extendType({  // 1
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {  // 2
      type: "Link",
      args: {   // 3
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const { description, url } = args;  // 4

        let idCount = links.length + 1;  // 5
        const link = {
          id: idCount,
          description: description,
          url: url,
        };
        links.push(link);
        return link;
      },
    });
  },
});