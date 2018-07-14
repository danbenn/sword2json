// const HTMLParser = require('fast-html-parser');
const tools = require('./tools');
const { ModuleConfig } = require('./ModuleConfig');
// Enable fetch api in Node.js
const fetch = tools.envType() === 'node' ? require('node-fetch') : fetch;

/**
 * Class to manage Sword module installation.
 */
class InstallManager {
  /**
   * Get a list of all available repos/sources from CrossWire's masterRepoList
   */
  async getRemoteRepositories() {
    if (!this.repos) {
      const url = 'http://crosswire.org/ftpmirror/pub/sword/masterRepoList.conf';
      const response = await fetch(url);
      const body = await response.text();
      const repos = [];
      body.split(/[\r\n]+/g).forEach((repo) => {
        const split = repo.split('|');
        repos.push({
          name: split[0].split('=')[2],
          url: split[1] + split[2],
          confUrl: `http://crosswire.org/ftpmirror${split[2]}/mods.d`,
        });
      });
      // Remove invalid repos
      this.repos = repos.filter(repo => repo && repo.url && repo.confUrl);
    }
    return this.repos;
  }

  /**
   * Download module from Crosswire main repository
   *
   * @param {string} moduleName
   */
  async downloadModule(moduleName) {
    this.moduleConfig = getModuleConfig(moduleName);
    if (tools.envType() === 'node') {
      const fileSystem = require('fs');
      fileSystem;
    }
  }

  /**
   * Get a list of all available modules.
   * Currently it only looks through the official Crosswire repository.
   */
  async getAvailableModules() {
    // this.url = 'https://crosswire.org/ftpmirror/pub/sword/raw/mods.d/';
    const url = 'https://crosswire.org/ftpmirror/pub/sword/raw/modules/texts/ztext/';
    this.listings = await this.fetchFTPServerListings(this.url);
    let moduleConfigs = await this.listings.map(getModuleConfig);
    // Remove configs we couldn't fetch
    moduleConfigs = moduleConfigs.filter(config => config);
    return moduleConfigs;
  }

  /**
   * Fetch page links from page of Crosswire's HTTP mirror of FTP module server.
   *
   * @param {string} url - Crosswire URL
   * @returns {Array} - array of page resource links
   */
  async fetchFTPServerListings(url) {
    if (this.listings) {
      return this.listings;
    }
    const response = await fetch(url);
    const body = await response.text();
    let root = HTMLParser.parse(body);
    root = root.firstChild.childNodes[3].childNodes.slice(3, 5)[0].childNodes;
    root = root.map(node => node.childNodes);
    // Remove null nodes
    root = root.filter(node => node);
    // Flatten array of arrays into array
    root = root.reduce((a, b) => a.concat(b), []);
    root = root.map(node => node.childNodes);
    root = root.reduce((a, b) => a.concat(b), []);
    root = root.map(node => node.childNodes);
    root = root.filter(node => node);
    root = root.reduce((a, b) => a.concat(b), []);
    root = root.map(node => node.rawText);
    root = root.map(node => node.slice(0, -1));
    // Remote page formatting artifacts
    root.splice(0, 5);
    this.listings = root;
    return root;
  }
}

async function getModuleConfig(moduleName) {
  // Config file contains metadata like full name, copyright info, etc.
  const configFileUrl = 'https://crosswire.org/ftpmirror' +
  `/pub/sword/raw/mods.d/${moduleName}.conf`;
  try {
    // Needed to avoid network errors due to so many requests
    const timeToWait = Math.floor(Math.random() * 50);
    await new Promise(resolve => setTimeout(resolve, timeToWait));
    const response = await fetch(configFileUrl);
    const body = await response.text();
    return new ModuleConfig(body);
    // console.log(config.description);
  } catch (error) {
    console.log(`Error: couldn't fetch config file from: ${configFileUrl}`);
    return null;
  }
}

async function demo() {
  const mgr = new InstallManager();
  const moduleNodes = await mgr.installModule('esv2011');
  // moduleNodes.forEach((moduleNode) => {
  //   console.log(moduleNode);
  //   console.log('******');
  // });
  // console.log(JSON.stringify(moduleNodes, null, 2));
}
demo();

module.exports = {
  InstallManager,
};

