import { createBrowserRouter, LoaderFunctionArgs } from "react-router-dom";
import Root from "./root";
import { ErrorBoundary } from "./root";
import LandingPage from "./routes/_anon._index";
import SignIn from "./routes/auth/sign-in";
import SignUp from "./routes/auth/sign-up";
import SyllabusUpload from "./routes/user/syllabus/upload";
import UserLayout, { loader as userLoader } from "./routes/_user";
import AuthLayout from "./routes/_auth";
import SyllabusResults from "./routes/user/syllabus/results/_user.syllabus-results.$id";
import AuthCallback from "./routes/auth/callback";



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
      {
        path: "auth/*",
        element: <AuthLayout />,
        children: [
          {
            path: "sign-up",
            element: <SignUp />,
          },
          {
            path: "sign-in",
            element: <SignIn />,
          },
          {
            path: "callback",
            element: <AuthCallback />,
          },
        ],
      },
      {
        path: "user/*",
        element: <UserLayout />,
        loader: userLoader,
        children: [
          {
            path: "syllabus-upload",
            element: <SyllabusUpload />,
          },
          {
            path: "syllabus-results/:id",
            element: <SyllabusResults />,
          },
          // Add other protected user routes here
        ],
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
