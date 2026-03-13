import '../uicomponents/Styles/paper.css';

type A4PortraitProps = {
  children?: React.ReactNode;
  pageNumber?: number;
};

export const A4Portrait = ({ children, pageNumber }: A4PortraitProps) => {
  return (
    <div className="a4-page main-page">
      <div className="paper-content">
        {children}
      </div>
      {pageNumber != null && (
        <div className="paper-page-number">{pageNumber}</div>
      )}
    </div>
  );
};