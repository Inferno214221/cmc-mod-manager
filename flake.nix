{
  description = "CMC Mod Manager Nix Flake";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [];
        pkgs = import nixpkgs {
          inherit system overlays;
          config = {
            permittedInsecurePackages = [ "electron-30.5.1" ];
          };
        };
      in
      {
        devShells.default = with pkgs; mkShell {
          buildInputs = [
            nodejs_18
            yarn
            electron_30
            dpkg
            fakeroot
            rpm
            zip
          ];

          # Wow, that was a lot of effort just to run an electron program I wrote!
          # This is the main thing you need to do to get electron-forge working
          # on Nix, but I couldn't find it anywhere:
          shellHook = ''
            rm -rf ./node_modules/electron/dist
            ln -s ${electron_30}/libexec/electron ./node_modules/electron/dist
          '';
        };
      }
    );
}
