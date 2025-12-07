export { HeroEditor } from "./HeroEditor";
export { PostsFeedEditor } from "./PostsFeedEditor";

export const BlockEditors = {
  Hero: HeroEditor,
  PostsFeed: PostsFeedEditor,
} as const;

