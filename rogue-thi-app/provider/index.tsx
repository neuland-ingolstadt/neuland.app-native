import { useColorScheme } from "react-native";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { NativeBaseProvider, extendTheme } from "native-base";

export function Provider({ children, ...rest }) {
  const scheme = useColorScheme();
  const config = {
    useSystemColorMode: true,
  };
  const customTheme = extendTheme({ config });

  return (
    <NativeBaseProvider theme={customTheme}>
      <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
        {children}
      </ThemeProvider>
    </NativeBaseProvider>
  );
}
