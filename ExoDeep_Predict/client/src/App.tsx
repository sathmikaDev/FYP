import Home from "./pages/Home";
import NavBar from "./components/NavBar";

function App() {
  return (
    <>
      <div>
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Home />
        </div>
      </div>
    </>
  );
}

export default App;
