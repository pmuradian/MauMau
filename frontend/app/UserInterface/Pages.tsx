import './Styles/paper.css';

import type { ReactNode } from 'react';

type A4PortraitProps = {
    children?: React.ReactNode;
};

export const A4Portrait = ({ children }: A4PortraitProps) => {
  return (
    <div className="paperA4Portrait" style={{ height: '80%', justifyContent: 'center', alignItems: 'center' , position: 'relative' }}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export const A4Landscape = (children: ReactNode) => {
  return (
    <div className="paperA4Landscape" style={{ height: '80%', justifyContent: 'center', alignItems: 'center' , position: 'relative' }}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export const Square = (children: ReactNode) => {
  return (
    <div className="square" style={{ height: '80%', justifyContent: 'center', alignItems: 'center' , position: 'relative' }}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
export const PageFormat = (className = "", children: ReactNode) => {
  return (
    <div className="${className}" style={{ height: '80%', justifyContent: 'center', alignItems: 'center' , position: 'relative' }}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

// export default { A4Rectangle, A4Portrait, A4Landscape, Square };