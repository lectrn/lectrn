function isActivityPub (req) {
  return [
    'application/ld+json; profile="https://www.w3.org/ns/activitystreams"',
    'application/activity+json'
  ].includes(req.get('Accept'))
}

function allowAllCors (res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
}

const models = require('../models')

async function getResourceForPath (path) {
  let matches

  if ((matches = path.match(/^\/@[a-z0-9_]{1,32}\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/))) {
    return (await models.Blip.query().where('uuid', matches[1]).withGraphFetched('user').limit(1))[0]
  }

  if ((matches = path.match(/^\/@([a-z0-9_]{1,32})/))) {
    return (await models.User.query().where('username', matches[1]).limit(1))[0]
  }

  return false
}

function isResourceInternal (baseUrl, resource) {
  const baseURL = new URL(baseUrl)
  const resourceURL = new URL(resource)

  return resourceURL.hostname === baseURL.hostname
}

module.exports = {
  isActivityPub,
  allowAllCors,
  getResourceForPath,
  isResourceInternal
}
