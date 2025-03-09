
import { Provider } from "react-redux";
import MainView from "./router/MainView";
import "./styles/index.scss"

import 'react-toastify/dist/ReactToastify.css';


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
