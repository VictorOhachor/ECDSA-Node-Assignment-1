const express = require("express");
const { createHash, randomBytes } = require("crypto");
const app = express();
const cors = require("cors");
const port = 3042;
const cookieParser = require("cookie-parser");

app.use(cors({
    origin: 'http://localhost:5173', // Replace with your React app's URL
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser('df7d3fc6f160446678270e049cd58067a03921e1bce07bfc034c21cecb55f8f8'))

const accounts = [];

const hash = (data) => {
    data = JSON.stringify(data);
    return createHash('sha256').update(data).digest('hex');
}

const getAccount = (address) => {
    return accounts.find((a) => a.address === address);
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;

  for (let account of accounts) {
    if (account.address === address) {
        return res.send({
            balance: account.balance || 0.0
        });
    }
  }

  return res.status(404).send({ error: 'Account not found!' });
});

app.post('/register', (req, res) => {
    const { address, balance } = req.body;

    let account = accounts.find((account) => account.address === address);

    if (account) {
        account.balance = balance;
    } else {
        account = {
            address,
            balance: parseFloat(balance),
            id: randomBytes(16).toString('hex')
        };

        accounts.push(account);
    }

    // hash the account and set it into a cookie
    res.cookie('acc_hash', hash(account), { httpOnly: true, sameSite: 'lax', expires: new Date(Date.now() + 3600000) });

    return res.status(201).send({ message: 'Synchronization done' });
});

app.post("/send", (req, res) => {
  let { sender, recipient, amount } = req.body;

  sender = getAccount(sender);

  // test that authorized sender own the account
  acc_hash = req.cookies.acc_hash;
  if ( hash(sender) !== acc_hash ) {
    return res.status(401).send({ error: 'You are unauthorized to perform this transaction' });
  }

  recipient = getAccount(recipient);

  if ( sender === recipient ) {
    return res.status(403).send(
        { message: 'Cannot transfer to the same account!' }
    );
  }

  if ( sender && recipient ) {
    if (sender.balance < amount) {
        return res.status(400).send({ message: "Not enough funds!" });
    }

    sender.balance -= amount;
    recipient.balance += amount;

    res.cookie('acc_hash', hash(sender), { httpOnly: true, sameSite: 'lax', expires: new Date(Date.now() + 3600000) })

    return res.send({ balance: sender.balance });
  }

  return res.status(400).send({ message: 'The recipient was not found.' })
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

