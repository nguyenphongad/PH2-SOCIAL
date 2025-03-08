
import { Provider } from "react-redux";
import MainView from "./pages/MainView";
import "./styles/index.scss"
import { BrowserRouter } from 'react-router-dom';
import { store } from "./redux/store";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <MainView />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
