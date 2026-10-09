import React from "react";
import { AbsoluteFill } from "remotion";
import { Classroom } from "./Classroom";
import { Stage } from "./Stage";

export type BackgroundWhich = "classroom" | "classroom-crack" | "stage" | "stage-blue" | "study" | "lab";

/** Renders one of the backgrounds by name (handy for previews / stills). */
export const BackgroundPreview: React.FC<{ which: BackgroundWhich }> = ({ which }) => {
  switch (which) {
    case "classroom":
      return <Classroom />;
    case "classroom-crack":
      return <Classroom crack={1} />;
    case "stage":
      return <Stage />;
    case "stage-blue":
      return <Stage hue="blue" />;
    default:
      return <AbsoluteFill style={{ background: "#333" }} />;
  }
};
