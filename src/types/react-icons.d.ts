declare module 'react-icons/*' {
  import * as React from 'react';

  export interface IconBaseProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = (props: IconBaseProps) => JSX.Element;

  export const IconContext: React.Context<{
    color?: string;
    size?: string | number;
    className?: string;
  }>;

  const content: { [key: string]: IconType };
  export default content;
}
