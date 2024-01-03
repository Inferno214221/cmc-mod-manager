import type IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

export const plugins: IForkTsCheckerWebpackPlugin[] = [
    new ForkTsCheckerWebpackPlugin({
        logger: "webpack-infrastructure",
    }),
];
