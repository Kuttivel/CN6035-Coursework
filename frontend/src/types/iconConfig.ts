type HexColor = `#${string}`;

type IconConfig = {
  iconAccent: HexColor;
  iconBackground: HexColor;
  iconUrl?: () => Promise<string>;
};

type IconState = {
  iconAccent: HexColor;
  iconBackground: HexColor;
  icon: string;
};