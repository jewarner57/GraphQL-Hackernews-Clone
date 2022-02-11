import { NexusGenObjects } from "../../nexus-typegen";  
import { arg, extendType, intArg, nonNull, objectType, stringArg } from "nexus";   

export const Link = objectType({
  name: "Link", 
  definition(t) { 
    t.nonNull.int("id"); 
    t.nonNull.string("description");
    t.nonNull.string("url"); 
    t.field("postedBy", {   // 1
      type: "User",
      resolve(parent, args, context) {  // 2
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context) {
        return context.prisma.link.findMany();
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
        const { id } = args

        return context.prisma.link.findUnique({
          where: {
            id: id
          }
        })
      },
    });
  },
});

export const LinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      resolve(parent, args, context) {
        const { description, url } = args;
        const { userId } = context;

        if (!userId) {  // 1
          throw new Error("Cannot post without logging in.");
        }

        const newLink = context.prisma.link.create({
          data: {
            description,
            url,
            postedBy: { connect: { id: userId } },  // 2
          },
        });

        return newLink;
      },
    });
  },
});

export const LinkDeletion = extendType({
  type: "Mutation",
  definition(t) {
    t.field("delete", {
      type: "Link",
      args: {
        id: nonNull(intArg())
      },

      resolve(parent, args, context) {
        const { id } = args;

        return context.prisma.link.delete({
          where: {
            id: id,
          },
        })
      },
    });
  },
});

export const LinkUpdate = extendType({
  type: "Mutation",
  definition(t) {
    t.field("update", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
        description: stringArg(),
        url: stringArg(),
      },

      resolve(parent, args, context) {
        const { id, description, url } = args;
        const data = {
          url: (url? url : undefined),
          description: (description? description : undefined)
        }

        return context.prisma.link.update({
          where: {
            id: id,
          },
          data: data
        })
      },
    });
  },
});