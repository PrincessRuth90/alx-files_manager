import sha1 from 'sha1';
import databaseClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
 
    static postNew(req, resp) {
        const { email } = req.body;
        const { password } = req.body;

        if (!email) {
            resp.status(400).json({ error: 'Missing email'});
            return;
        }
        if (!password) {
            resp.status(400).json({ error: 'Missing password'});
            return;
        }

        const users = databaseClient.db.collection('users');
        users.findOne({ email }, (err, user) => {
        if (user) {
            resp.status(400).json({ error: 'Already exist'});
        } else {
            const hashedpword = sha1(password);
            users.insertOne(
            {
                email,
                password: hashedpword,
            },
            ).then((result) => {
            resp.status(201).json({ id: result.insertedId, email });
            }).catch((error) => console.log(error));
        }
        });
    }


}

module.exports = UsersController;
