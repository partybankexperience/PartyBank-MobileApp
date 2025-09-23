import React from "react";
import Svg, { Path } from "react-native-svg";

const NotificationIcon = ({ width = 25, height = 24, fill = "#ABAAAA" }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M19.5 18V9.5C19.5 5.63401 16.366 2.5 12.5 2.5C8.63401 2.5 5.5 5.63401 5.5 9.5V18"
        stroke={fill}
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <Path
        d="M21 18H4"
        stroke={fill}
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <Path
        d="M14 20C14 20.8284 13.3284 21.5 12.5 21.5M12.5 21.5C11.6716 21.5 11 20.8284 11 20M12.5 21.5V20"
        stroke={fill}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default NotificationIcon;
