import { Outlet, redirect, useOutletContext } from "react-router";
import { getSession } from "@/lib/supabase";
import type { LoaderFunctionArgs } from "react-router-dom";

interface RootOutletContext {
  user?: any;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const session = await getSession();
    if (session) {
      return redirect('/user/syllabus-upload');
    }
    return null;
  } catch (error) {
    // If there's an error getting the session, we'll just show the anon pages
    return null;
  }
};

export default function () {
  const context = useOutletContext<RootOutletContext>();

  return (
    <div className="w-screen h-screen grid place-items-center">
      <Outlet context={context} />
    </div>
  );
}
