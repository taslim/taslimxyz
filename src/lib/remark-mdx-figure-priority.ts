// Remark plugin to automatically add priority to the first Figure in MDX content
// Heuristic: The first Figure in a blog post is typically the hero image
// and appears above the fold, so we mark it with priority for LCP optimization.

type MdxJsxAttribute = {
  type: "mdxJsxAttribute";
  name: string;
  value?: unknown;
};

type MdxJsxFlowElement = {
  type: "mdxJsxFlowElement";
  name: string;
  attributes?: MdxJsxAttribute[];
  children?: MdxNode[];
};

type MdxNode =
  | MdxJsxFlowElement
  | {
      type: string;
      children?: MdxNode[];
      [key: string]: unknown;
    };

type Root = {
  type: "root";
  children?: MdxNode[];
};

export function remarkMdxFigurePriority() {
  return (tree: Root) => {
    let hasMarkedFigure = false;

    const visit = (node: MdxNode): void => {
      if (hasMarkedFigure) return;

      if (node.type === "mdxJsxFlowElement") {
        const mdxNode = node as MdxJsxFlowElement;
        if (mdxNode.name === "Figure") {
          const attrs = mdxNode.attributes ?? [];

          // Check if priority is already explicitly set (respect manual overrides)
          const alreadyHasPriority = attrs.some(
            (attr) =>
              attr.type === "mdxJsxAttribute" && attr.name === "priority",
          );

          if (!alreadyHasPriority) {
            attrs.push({
              type: "mdxJsxAttribute",
              name: "priority",
              value: true,
            });
            mdxNode.attributes = attrs;
          }

          hasMarkedFigure = true;
          return;
        }
      }

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          visit(child);
          if (hasMarkedFigure) break;
        }
      }
    };

    if (tree.children) {
      for (const child of tree.children) {
        visit(child);
        if (hasMarkedFigure) break;
      }
    }
  };
}
