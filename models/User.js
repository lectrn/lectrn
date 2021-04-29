const { Model } = require('objection')

class User extends Model {
  static get tableName () {
    return 'users'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'username', 'password', 'name'],

      properties: {
        id: { type: 'integer' },
        username: { type: 'string', minLength: 1, maxLength: 32, pattern: '^[a-z0-9_]+$' },
        password: { type: 'string' }, // NOTE: This is hashed: plaintext password length will have to be validated by the API endpoint.
        name: { type: 'string', minLength: 1, maxLength: 256 },
        summary: { type: ['string', 'null'], minLength: 0, maxLength: 500 }
      }
    }
  }

  // Convert model into ActivityPub object
  activityPub () {
    const id = new URL('/@' + this.username, process.env.BASE_URL).href
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id,
      type: 'Person',
      inbox: id + '/inbox',
      outbox: id + '/outbox',
      preferredUsername: this.username,
      name: this.name,
      summary: this.summary || undefined
    }
  }

  // Conert model into WebFinger object
  webfinger () {
    const url = new URL('/@' + this.username, process.env.BASE_URL).href
    return {
      subject: 'acct:' + this.username + '@' + new URL(process.env.BASE_URL).hostname,
      aliases: [
        url
      ],
      links: [
        {
          rel: 'http://webfinger.net/rel/profile-page',
          type: 'text/html',
          href: url
        },
        {
          rel: 'self',
          type: 'application/activity+json',
          href: url
        },
        {
          rel: 'self',
          type: 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"',
          href: url
        }
      ]
    }
  }
}

module.exports = User
