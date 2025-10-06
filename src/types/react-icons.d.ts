declare module 'react-icons/*' {
  import { FC, SVGProps } from 'react';

  export interface IconBaseProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = FC<IconBaseProps>;

  export const IconContext: React.Context<{
    color?: string;
    size?: string | number;
    className?: string;
  }>;

  const content: { [key: string]: IconType };
  export default content;
}
