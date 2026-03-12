import '../uicomponents/Styles/paper.css';

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