const PasswordValidator = require('password-validator');
const schema = new PasswordValidator();
const configurePasswordPolicy = (options) => {
  schema
    .is().min(options.minLength || 8) 
    .is().max(options.maxLength || 100) 
    .has().uppercase(options.requireUppercase !== false) 
    .has().lowercase(options.requireLowercase !== false) 
    .has().digits(options.requireDigits !== false) 
    .has().symbols(options.requireSymbols !== false) 
    .is().not().oneOf(options.disallowedPasswords || []); 
  return schema;
};

module.exports = configurePasswordPolicy;
