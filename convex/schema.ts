import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notifications: defineTable({
    text: v.string(),
    isRead: v.boolean(),
    userId: v.optional(v.string()),  // Make userId optional
  }),
});
