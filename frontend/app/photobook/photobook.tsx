import { useNavigate } from "react-router-dom";

const MyStyledButton = () => {

    let navigate = useNavigate(); 
    const routeChange = () =>{ 
      let path = `photobook`;
      navigate(path);
    }

    return (
        <button
            style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50', // Green
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
            }}
            onClick={() => 
                routeChange()
            }
        >
          Click Me (Styled)
        </button>
    );
};

export default function Photobook() {
    return (<div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <MyStyledButton />
            </div>
            )
}

// const App = () => {
//     return (
//       <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
//         <MyButton />
//         <MyStyledButton />
//       </div>
//     )
// }