import { createHashRouter } from "react-router";
import Desktop from "../imports/Desktop1";
import WishPage from "./components/WishPage";
import RoomPage from "./components/RoomPage";

export const router = createHashRouter([
  {
    path: "/",
    Component: Desktop,
  },
  {
    path: "/wish",
    Component: WishPage,
  },
  {
    path: "/room",
    Component: RoomPage,
  },
  {
    path: "*",
    Component: Desktop,
  },
]);
