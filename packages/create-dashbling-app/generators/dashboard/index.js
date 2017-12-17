const { ensureDirSync, readJsonSync, writeJsonSync } = require("fs-extra");
const { resolve } = require("path");
const Generator = require("yeoman-generator");

const isYarn = !!process.env.npm_execpath.match(/yarn.js/);
const installer = isYarn ? "yarn" : "npm";

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.installDependency = isYarn ? this.yarnInstall : this.npmInstall;
  }

  paths() {
    this.destinationRoot(this.options.directory);
  }

  _copy(path) {
    this.fs.copy(this.templatePath(path), this.destinationPath(path));
  }

  writing() {
    ensureDirSync(this.destinationPath());

    this.spawnCommandSync(installer, ["init", "--yes"]);

    this.installDependency(["dashbling"]);

    const jsonPath = this.destinationPath("package.json");
    const json = readJsonSync(jsonPath);
    const packageJson = Object.assign(json, {
      scripts: {
        start: "dashbling start",
        dev: "NODE_ENV=development dashbling start"
      },
      browserslist: "last 2 versions"
    });

    writeJsonSync(jsonPath, packageJson, { spaces: 2 });

    [
      ".gitignore",
      "dashbling.config.js",
      "index.html",
      "index.js",
      "Dashboard.js",
      "widgets/",
      "styles/",
      "jobs/"
    ].forEach(this._copy.bind(this));
  }
};