declare module "react-katex" {
  import type { ReactElement, ReactNode } from "react";

  /**
   * Props acceptées par react-katex.
   *
   * react-katex ne transmet à KaTeX que :
   *   - math
   *   - block (pour BlockMath uniquement)
   *   - errorColor
   *   - renderError
   *   - settings (partiellement)
   *
   * On garde une signature permissive pour éviter les erreurs TS
   * si l'implémentation évolue.
   */
  export interface KatexProps {
    /** Expression LaTeX à rendre (obligatoire). */
    math: string;
    /** Contenu optionnel (rarement utilisé, équivalent à math). */
    children?: ReactNode;
    /** Rendu en mode bloc (display) plutôt qu'inline. */
    block?: boolean;
    /** Couleur utilisée en cas d'erreur de parsing. */
    errorColor?: string;
    /** Rendu personnalisé en cas d'erreur. */
    renderError?: (error: Error) => ReactNode;
    /** Options KaTeX (macros, strict, trust, throwOnError, …). */
    settings?: Record<string, unknown>;
    /** Autres props KaTeX éventuelles. */
    [key: string]: unknown;
  }

  export function InlineMath(props: KatexProps): ReactElement;
  export function BlockMath(props: KatexProps): ReactElement;

  const _default: {
    InlineMath: typeof InlineMath;
    BlockMath: typeof BlockMath;
  };
  export default _default;
}
