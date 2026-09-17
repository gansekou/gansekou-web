declare module "react-katex" {
  import type { ReactNode } from "react";

  export interface KatexProps {
    children?: ReactNode;
    math: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
    settings?: Record<string, unknown>;
    throwOnError?: boolean;
    trust?: boolean | ((context: unknown) => boolean);
    strict?: boolean | string | ((errorCode: string, errorMsg: string, token?: unknown) => string);
    macros?: Record<string, string>;
  }

  export function InlineMath(props: KatexProps): JSX.Element;

  export function BlockMath(props: KatexProps): JSX.Element;
}
