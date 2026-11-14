import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <div className="size-full min-h-screen w-screen overflow-hidden bg-background text-foreground">
      <RouterProvider router={router} fallbackElement={<div className="w-full h-screen bg-[#021135]" />} />
    </div>
  );
}
