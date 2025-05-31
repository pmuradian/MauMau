import './Styles/paper.css';
import useWindowDimensions from './UserInterfaceComponents';

const A4Rectangle = ({ orientation = 'portrait', className = '', children }) => {
  // A4 aspect ratios:
  // Portrait: 210 / 297 = 0.7071 (approximately 1 / 1.414)
  // Landscape: 297 / 210 = 1.4142 (approximately 1.414 / 1)
  const aspectRatio = orientation === 'portrait' ? '1 / 1.414' : '1.414 / 1';
  const { height, width } = useWindowDimensions();
  return (
    <div className="paper" style={{ height: height * 0.8, justifyContent: 'center', alignItems: 'center' , position: 'relative' }}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default A4Rectangle;