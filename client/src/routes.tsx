import { createBrowserRouter } from "react-router-dom";
import Root from "./root";
import { ErrorBoundary } from "./root";
import LandingPage from "./routes/_anon._index";

// Import your route components here
// import Home from "./routes/home";
// import About from "./routes/about";
// etc.

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      // Add other routes here
      // {
      //   path: "/",
      //   element: <Home />,
      // },
      // {
      //   path: "/about",
      //   element: <About />,
      // },
    ],
  },
]);
