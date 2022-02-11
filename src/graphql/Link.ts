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

export const LinkDeletion = extendType({  // 1
  type: "Mutation",
  definition(t) {
    t.field("delete", {  // 2
      type: "Link",
      args: {   // 3
        id: nonNull(intArg())
      },

      resolve(parent, args, context) {
        const { id } = args;  // 4
        const linkIndex = links.findIndex(obj => obj.id === id)

        if(linkIndex === -1) {
          return null;
        }

        const link = links[linkIndex]
        links.splice(linkIndex, 1)
        return link
      },
    });
  },
});

export const LinkUpdate = extendType({  // 1
  type: "Mutation",
  definition(t) {
    t.field("update", {  // 2
      type: "Link",
      args: {   // 3
        id: nonNull(intArg()),
        description: stringArg(),
        url: stringArg(),
      },

      resolve(parent, args, context) {
        const { id, description, url } = args;  // 4
        const linkIndex = links.findIndex(obj => obj.id === id)

        if (linkIndex == -1) {
          return null;
        }

        const link = links[linkIndex]
        const updatedLink = {
          id: id,
          url: url || link.url,
          description: description || link.description
        }

        links[linkIndex] = updatedLink

        return links[linkIndex]
      },
    });
  },
});