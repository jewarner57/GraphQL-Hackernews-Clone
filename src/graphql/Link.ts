import { extendType, nonNull, objectType, stringArg, intArg, inputObjectType, enumType, arg, list } from "nexus";
import { Prisma } from "@prisma/client" 

export const Link = objectType({
  name: "Link", 
  definition(t) { 
    t.nonNull.int("id"); 
    t.nonNull.string("description");
    t.nonNull.string("url"); 
    t.nonNull.dateTime("createdAt");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field("voters", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .voters();
      }
    })
  },
});

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("links", { type: Link });
    t.nonNull.int("count");
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {  // 1
      type: "Feed",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
      },
      async resolve(parent, args, context) {
        const where = args.filter
          ? {
            OR: [
              { description: { contains: args.filter } },
              { url: { contains: args.filter } },
            ],
          }
          : {};

        const links = await context.prisma.link.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
            | undefined,
        });

        const count = await context.prisma.link.count({ where });  // 2

        return {  // 3
          links,
          count,
        };
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

export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("description", { type: Sort });
    t.field("url", { type: Sort });
    t.field("createdAt", { type: Sort });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});