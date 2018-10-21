const express = require('express');
const msRestAzure = require('ms-rest-azure');
const KeyVault = require('azure-keyvault');
const KEY_VAULT_URI = null || process.env['KEY_VAULT_URI'];

let app = express();
let clientId = process.env['CLIENT_ID']; // service principal
let domain = process.env['DOMAIN']; // tenant id
let secret = process.env['APPLICATION_SECRET'];

function getKeyVaultCredentials(){
  if (process.env.APPSETTING_WEBSITE_SITE_NAME){
    return msRestAzure.loginWithAppServiceMSI();
  } else {
    return msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain);
  }
}

function getKeyVaultSecret(credentials) {
  let keyVaultClient = new KeyVault.KeyVaultClient(credentials);
  return keyVaultClient.getSecret(KEY_VAULT_URI, 'secret', "");
}

app.get('/', function (req, res) {
  getKeyVaultCredentials().then(
    getKeyVaultSecret
  ).then(function (secret){
    res.send(`Your secret value is: ${secret.value}.`);
  }).catch(function (err) {
    res.send(err);
  });
});

app.get('/ping', function (req, res) {
  res.send('Hello World!!!');
});

app.get('/env', function (req, res) {
  var rtn = "Env:\n";
  rtn += "APPSETTING_WEBSITE_SITE_NAME=";
  rtn += process.env.APPSETTING_WEBSITE_SITE_NAME;
  rtn += "\nMSI_ENDPOINT=";
  rtn += process.env.MSI_ENDPOINT;
  rtn += "\nMSI_SECRET=";
  rtn += process.env.MSI_SECRET;
  res.send(rtn);
});

let port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server running at http://localhost:${port}`);
});