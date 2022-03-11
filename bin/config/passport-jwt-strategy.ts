import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { TokenPayload } from '../database/types'
import { UserData, UserDataInterface } from '../database/user'

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

passport.use(new Strategy(opts, async function (payload: TokenPayload, done) {
  try {
    const _db: UserDataInterface = new UserData()

    const _user = await _db.getUserById(payload.userId)

    if (_user) {
      return done(null, _user)
    } else {
      return done(null, false)
    }
  } catch (e) {
    done(e, false)
  }
}))
