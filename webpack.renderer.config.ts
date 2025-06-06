import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

rules.push({
    test: /\.css$/,
    loader: "style-loader"
});

rules.push({
    test: /\.css$/,
    loader: "css-loader",
    options: {
        modules: {
            localIdentName: "[name]_[local]",
            exportLocalsConvention: "camelCase"
        },
    }
});

rules.push({
    test: /\.(png|jpe?g|gif|jp2|webp|svg)$/,
    type: "asset/resource"
});

export const rendererConfig: Configuration = {
    module: {
        rules,
    },
    plugins,
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    },
};
