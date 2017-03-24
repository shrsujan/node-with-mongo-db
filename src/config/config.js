import dotenv from 'dotenv'

dotenv.config()

export default {
  port: process.env.PORT || 1234,
  database: {
    connection: {
      url: (process.env.NODE_ENV === 'test') ? process.env.TEST_DB_URL : process.env.DB_URL
      // host: process.env.DB_HOST || '127.0.0.1',
      // user: process.env.DB_USER || 'root',
      // password: process.env.DB_PASSWORD || '',
      // database: process.env.DB_DATABASE || 'test',
      // dialect: process.env.DB_DIALECT || 'mysql'
    }
  },
  bcrypt: {
    saltRounds: 10
  },
  jwt: {
    jwtSecret: 'test!@#$%test',
    refreshJwtSecret: '!@#$%refresh!@#$%',
    accessExpInMin: 2000,
    refreshExpInMin: 259200
  }
}
