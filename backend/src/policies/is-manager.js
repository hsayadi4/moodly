'use strict';

// verifie que l'utilisateur connecte a bien le role manager
module.exports = (policyContext) => {
  const user = policyContext.state.user;
  return user && user.role && user.role.type === 'manager';
};
