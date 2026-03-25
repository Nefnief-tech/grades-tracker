import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <span className="text-xl">📊</span>
        <span className="font-semibold">Grade Tracker</span>
      </>
    ),
    url: "/grades-tracker",
  },
  links: [
    {
      text: "Documentation",
      url: "/grades-tracker/docs",
      active: "nested-url",
    },
    {
      text: "GitHub",
      url: "https://github.com/Nefnief-tech/grades-tracker",
      external: true,
    },
  ],
};
