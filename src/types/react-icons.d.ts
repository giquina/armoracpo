declare module 'react-icons/*' {
  import * as React from 'react';

  export interface IconBaseProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = React.ComponentType<IconBaseProps>;

  export const IconContext: React.Context<{
    color?: string;
    size?: string | number;
    className?: string;
  }>;

  const content: { [key: string]: IconType };
  export default content;
}
