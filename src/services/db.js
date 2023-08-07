const knex = require("knex");
const dbConfig = require("../../knexfile");

const db = knex(dbConfig.development);

function connectMiddleware(req, res, next) {
  db.raw('select 1+1 as result')
    .then(() => {
      next();
    })
    .catch(() => {
      throw new Error('No db connection');
    });
}

function getUserById(req, res) {
  const id = req.params.id;
  db("user")
    .where("id", id)
    .returning("*")
    .then(([result]) => {
      if (!result) {
        res.status(404).send({ error: 'User not found' });
        return;
      }
      return res.send({
        ...result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
}

function createUser(req, res) {
  const user = { ...req.body };
  user.balance = 0;
  db("user")
    .insert(user)
    .returning("*")
    .then(([result]) => {
      result.createdAt = result.created_at;
      delete result.created_at;
      result.updatedAt = result.updated_at;
      delete result.updated_at;
      return res.send({
        ...result,
        accessToken: jwt.sign({ id: result.id, type: result.type }, process.env.JWT_SECRET),
      });
    })
    .catch((err) => {
      if (err.code == '23505') {
        res.status(400).send({
          error: err.detail,
        });
        return;
      }
      res.status(500).send("Internal Server Error");
    });
}

function updateUser(req, res) {
  const userId = req.params.id;
  const tokenPayload = auth.getTokenPayload(req);
  const schema = joi.object({
    email: joi.string().email(),
    phone: joi.string().pattern(/^\+?3?8?(0\d{9})$/),
    name: joi.string(),
    city: joi.string(),
  }).required();
  const isValidResult = schema.validate(req.body);
  if (isValidResult.error) {
    res.status(400).send({ error: isValidResult.error.details[0].message });
    return;
  }
  if (userId !== tokenPayload.id) {
    return res.status(401).send({ error: 'UserId mismatch' });
  }
  db("user")
    .where('id', userId)
    .update(req.body)
    .returning("*")
    .then(([result]) => {
      return res.send({
        ...result,
      });
    })
    .catch((err) => {
      if (err.code == '23505') {
        console.log(err);
        res.status(400).send({
          error: err.detail,
        });
        return;
      }
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
}

function createTransaction(req, res) {
    const transaction = { ...req.body };
    db("user")
      .where('id', transaction.userId)
      .then(([user]) => {
        if (!user) {
          res.status(400).send({ error: 'User does not exist' });
          return;
        }
        transaction.card_number = transaction.cardNumber;
        delete transaction.cardNumber;
        transaction.user_id = transaction.userId;
        delete transaction.userId;
  
        db("transaction")
          .insert(transaction)
          .returning("*")
          .then(([result]) => {
            const currentBalance = user.balance + transaction.amount;
            db("user")
              .where('id', transaction.user_id)
              .update('balance', currentBalance)
              .then(() => {
                ['user_id', 'card_number', 'created_at', 'updated_at'].forEach(whatakey => {
                  const index = whatakey.indexOf('_');
                  let newKey = whatakey.replace('_', '');
                  newKey = newKey.split('')
                  newKey[index] = newKey[index].toUpperCase();
                  newKey = newKey.join('');
                  result[newKey] = result[whatakey];
                  delete result[whatakey];
                });
                res.send({
                  ...result,
                  currentBalance,
                });
              });
          });
      })
      .catch(err => {
        res.status(500).send("Internal Server Error");
      });
  }
  
  function createEvent(req, res) {
    const event = { ...req.body };
    event.odds.home_win = event.odds.homeWin;
    delete event.odds.homeWin;
    event.odds.away_win = event.odds.awayWin;
    delete event.odds.awayWin;
  
    db("odds")
      .insert(event.odds)
      .returning("*")
      .then(([odds]) => {
        delete event.odds;
        event.away_team = event.awayTeam;
        event.home_team = event.homeTeam;
        event.start_at = event.startAt;
        delete event.awayTeam;
        delete event.homeTeam;
        delete event.startAt;
        db("event")
          .insert({
            ...event,
            odds_id: odds.id
          })
          .returning("*")
          .then(([event]) => {
            statEmitter.emit('newEvent');
            ['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at'].forEach(whatakey => {
              const index = whatakey.indexOf('_');
              let newKey = whatakey.replace('_', '');
              newKey = newKey.split('')
              newKey[index] = newKey[index].toUpperCase();
              newKey = newKey.join('');
              event[newKey] = event[whatakey];
              delete event[whatakey];
            });
            ['home_win', 'away_win', 'created_at', 'updated_at'].forEach(whatakey => {
              const index = whatakey.indexOf('_');
              let newKey = whatakey.replace('_', '');
              newKey = newKey.split('')
              newKey[index] = newKey[index].toUpperCase();
              newKey = newKey.join('');
              odds[newKey] = odds[whatakey];
              delete odds[whatakey];
            });
            res.send({
              ...event,
              odds,
            });
          })
      })
      .catch(err => {
        console.log(err);
        res.status(500).send("Internal Server Error");
      });
  }
  
  function createBet(req, res) {
    const userId = req.body.userId;
    db("user")
      .where('id', userId)
      .then(([user]) => {
        if (!user) {
          res.status(400).send({ error: 'User does not exist' });
          return;
        }
        if (+user.balance < +req.body.betAmount) {
          return res.status(400).send({ error: 'Not enough balance' });
        }
        db('event')
          .where('id', req.body.eventId)
          .then(([event]) => {
            if (!event) {
              return res.status(404).send({ error: 'Event not found' });
            }
            db('odds')
              .where('id', event.odds_id)
              .then(([odds]) => {
                if (!odds) {
                  return res.status(404).send({ error: 'Odds not found' });
                }
                let multiplier;
                switch (req.body.prediction) {
                  case 'w1':
                    multiplier = odds.home_win;
                    break;
                  case 'w2':
                    multiplier = odds.away_win;
                    break;
                  case 'x':
                    multiplier = odds.draw;
                    break;
                }
                db("bet")
                  .insert({
                    ...req.body,
                    multiplier,
                    event_id: event.id
                  })
                  .returning("*")
                  .then(([bet]) => {
                    const currentBalance = user.balance - req.body.betAmount;
                    db('user')
                      .where('id', userId)
                      .update({
                        balance: currentBalance,
                      })
                      .then(() => {
                        statEmitter.emit('newBet');
                        ['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at', 'user_id'].forEach(whatakey => {
                          const index = whatakey.indexOf('_');
                          let newKey = whatakey.replace('_', '');
                          newKey = newKey.split('')
                          newKey[index] = newKey[index].toUpperCase();
                          newKey = newKey.join('');
                          bet[newKey] = bet[whatakey];
                          delete bet[whatakey];
                        });
                        res.send({
                          ...bet,
                          currentBalance: currentBalance,
                        });
                      });
                  });
              });
          });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send("Internal Server Error");
      });
  }
  
  function updateEventResult(req, res) {
    const eventId = req.params.id;
    db('bet')
      .where('event_id', eventId)
      .andWhere('win', null)
      .then((bets) => {
        const [w1, w2] = req.body.score.split(":");
        let result;
        if (+w1 > +w2) {
          result = 'w1';
        } else if (+w2 > +w1) {
          result = 'w2';
        } else {
          result = 'x';
        }
        db('event')
          .where('id', eventId)
          .update({ score: req.body.score })
          .returning('*')
          .then(([event]) => {
            Promise.all(bets.map((bet) => {
              if (bet.prediction == result) {
                db('bet')
                  .where('id', bet.id)
                  .update({
                    win: true
                  });
                db('user')
                  .where('id', bet.user_id)
                  .then(([user]) => {
                    return db('user')
                      .where('id', bet.user_id)
                      .update({
                        balance: user.balance + (bet.bet_amount * bet.multiplier),
                      });
                  });
              } else if (bet.prediction != result) {
                return db('bet')
                  .where('id', bet.id)
                  .update({
                    win: false
                  });
              }
            }));
            setTimeout(() => {
              ['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at'].forEach(whatakey => {
                const index = whatakey.indexOf('_');
                let newKey = whatakey.replace('_', '');
                newKey = newKey.split('')
                newKey[index] = newKey[index].toUpperCase();
                newKey = newKey.join('');
                event[newKey] = event[whatakey];
                delete event[whatakey];
              });
              res.send(event);
            }, 1000);
          });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send("Internal Server Error");
      });
  }

module.exports = {
  connectMiddleware,
  getUserById,
  createUser,
  updateUser,
  createTransaction,
  createEvent,
  createBet,
  updateEventResult,
};
