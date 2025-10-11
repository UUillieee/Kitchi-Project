module.exports = {
  getEnforcing: (name) => {
    if (name === 'DevMenu') return {}; // safe empty DevMenu
    return {};
  },
  get: () => ({}),
};
