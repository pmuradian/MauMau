import './Styles/paper.css';

import type { ReactNode } from 'react';

type A4PortraitProps = {
  children?: React.ReactNode;
};

export const A4Portrait = ({ children }: A4PortraitProps) => {
  return (
    <div className="a4-page main-page">
      <div className="paper-content">
        {children}
      </div>
    </div>
  );
};

export const A4Landscape = (children: ReactNode) => {
  return (
    <div className="a4-page" style={{ aspectRatio: '1.4142' }}>
      <div className="paper-content">
        {children}
      </div>
    </div>
  );
};

export const Square = (children: ReactNode) => {
  return (
    <div className="a4-page" style={{ aspectRatio: '1' }}>
      <div className="paper-content">
        {children}
      </div>
    </div>
  );
};
export const PageFormat = (className = "", children: ReactNode) => {
  return (
    <div className={className} style={{ height: '80%', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <div className="paper-content">
        {children}
      </div>
    </div>
  );
}

// export default { A4Rectangle, A4Portrait, A4Landscape, Square };