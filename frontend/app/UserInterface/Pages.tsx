import './Styles/paper.css';
import useWindowDimensions from './UserInterfaceComponents';

import type { ReactNode } from 'react';

type A4PortraitProps = {
    children?: React.ReactNode;
};

export const A4Portrait = ({ children }: A4PortraitProps) => {
  const height = useWindowDimensions().height;
  return (
    <div className="paperA4Portrait" style={{ height: height * 0.8, justifyContent: 'center', alignItems: 'center' , position: 'relative' }}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export const A4Landscape = (children: ReactNode) => {
  const height = useWindowDimensions().height;
  return (
    <div className="paperA4Landscape" style={{ height: height * 0.8, justifyContent: 'center', alignItems: 'center' , position: 'relative' }}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export const Square = (children: ReactNode) => {
  const height = useWindowDimensions().height;
  return (
    <div className="square" style={{ height: height * 0.8, justifyContent: 'center', alignItems: 'center' , position: 'relative' }}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
export const PageFormat = (className = "", children: ReactNode) => {
  const height = useWindowDimensions().height;
  return (
    <div className="${className}" style={{ height: height * 0.8, justifyContent: 'center', alignItems: 'center' , position: 'relative' }}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

// export default { A4Rectangle, A4Portrait, A4Landscape, Square };