declare module "next/link" {
  import type { ComponentType, AnchorHTMLAttributes } from "react";
  const Link: ComponentType<
    AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean }
  >;
  export default Link;
}
