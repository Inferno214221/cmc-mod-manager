import type IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

/* eslint-disable @typescript-eslint/no-var-requires */
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin =
    require("fork-ts-checker-webpack-plugin");
/* eslint-enable @typescript-eslint/no-var-requires */

export const plugins: IForkTsCheckerWebpackPlugin[] = [
    new ForkTsCheckerWebpackPlugin({
        logger: "webpack-infrastructure",
    }),
];
