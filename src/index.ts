import * as express from "express";
import {json} from "body-parser";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Chart } from "./entities/Chart";
import { DataSource } from "./entities/DataSource";
import { validate } from "class-validator";

import passport = require("passport");
import passportLocal = require("passport-local");
import session = require("express-session");
import flash = require("express-flash");
import cookieParser = require("cookie-parser");

/* ────────────────────────────────────────────────────────────────────────── */

const PORT = 5000;

/* ────────────────────────────────────────────────────────────────────────── */
interface IError {
    code: number;
    message: string;
};

class InvalidOperation implements IError {
    code = 100;
    message = "Invalid Operation. Try Again.";
    constructor() {

    }
};

class NonExistentUser implements IError {
    code = 200;
    message = "User don't exists.";
};

class NonExistentDataSourceIDs implements IError {
    code = 400;
    message = "Some Data Source IDs don't exits.";
}

createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "code",
    password: "password",
    database: "test",
    entities: [
        User,
        Chart,
        DataSource,
    ],
    synchronize: true,

})
.then(async connection => {
    const app = express();

    app.use(json());

    app.get("/", (req, res, next) => {
        res.send("Hello");
        next();
    });

    app.get("/login", (req, res, next) => {
        res.send("Login");
        next();
    });



    const usersRepository       = connection.getRepository(User);
    const dataSourcesRepository = connection.getRepository(DataSource);
    const chartsRepository      = connection.getRepository(Chart);

/*                              HELPER FUNCTIONS                              */

    const getUser = async (id: any) => {
        const uid = parseInt(id);
        const user = await usersRepository.findOne(uid);
        if (!user)
            throw new NonExistentUser();

        return user;
    }

    const convertToDataSource = async(ids: [], owner: User) => {
        const dataSources = await dataSourcesRepository.findByIds(ids, {
            where: {owner: owner}
        });

        if (dataSources.length !== ids.length)
            throw new NonExistentDataSourceIDs();

        return dataSources;
    }

/*                             API - AUTENTICAÇÃO                             */

    passport.serializeUser(async (user: User, done) => {
        done(null, user.id);
    })

    passport.deserializeUser(async (id: number, done) => {
        const user = await usersRepository.findOne(id);
        done(null, user);
    });

    app.use(cookieParser("sensorize"));
    app.use(session({
        secret: "sensorize",        // Chave.

        resave: false,              // Reduz a cargo no servidor.

        saveUninitialized: false,   // Reduz o armazenamento de sessões no
                                    // servidor
    }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new passportLocal.Strategy({
        usernameField: "email",
        passwordField: "password",
    },
    async (email, password, done) => {
        const user = await usersRepository.findOne({
            where: {email: email, password: password,}
        });

        if (user)
            done(null, user, {message: "Success!"});
        else
            done(null, false, {message: "Fail!"});
    }));

    app.post("/login", passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    }));

    app.get("/logout", (req, res, next) => {
        req.logOut();
        res.redirect("/login");
        next();
    });

/*                                API - USUÁRIO                               */
    app
    .route("/users")
    .post(async (req, res, next) => {
        let user = new User();
        user = usersRepository.merge(user, req.body);

        const userErrors = await validate(user);

        // Retorna os dados cadastrado caso não haja erros. Se houver erros,
        // retorne os erros de validação.
        try {
            if (userErrors.length > 0)
                throw userErrors.map(error => error.constraints);

            await connection.transaction(async transaction =>
                await transaction.insert(User, user)
            );

            // Não reenvie a senha.
            delete user.password;

            res.status(200).json(user);

        } catch (error) {
            next(error);
        }
    });

/*                                 SECURE ZONE                                */

    app.use((req, res, next)=> {
        if (req.user == undefined) {
            if (!res.headersSent)
                res.sendStatus(401);
        } else {
            next();
        }
    })

    app
    .route("/users/:id")
    .get(async (req, res, next) => {
        try {
            const user = await getUser(req.params.id);

            delete user.password;

            res.json(user);

        } catch (error) {
            next(error);
        }
    })
    .put(async (req, res, next) => {    // Atualiza dados de um usuário.
        try {
            const uid = parseInt(req.params.id);

            // Busca o usuário baseado no id.
            let user = await usersRepository.findOne(uid);

            user = usersRepository.merge(user, req.body);

            // Valida os dados do usuário.
            const userErrors = await validate(user);

            // Responde baseado se há erros ou não.
            if (userErrors.length === 0) {
                connection.transaction(async transaction => {
                    // O body é validado com todo objeto apenas para fins de
                    // validação, porém apenas a parte contida no body é
                    // utilizada para a modificação.
                    await transaction.update(User, uid, req.body);
                });

                // Não retorne a senha.
                delete user.password;

                // Retorna os dados do usuário após a modificação.
                res.status(200).json(user);
            } else {
                throw userErrors.map(error => error.constraints);
            }
        } catch(error) {
            // Retorna os erros de validação.
            next(error);
            // res.status(400).json({error: error});
        }
    })
    .delete(async (req, res, next) => { // Remove um usuário.
        try {
            const uid = parseInt(req.params.id);
            let user = await usersRepository.findOne(uid);

            await connection.transaction(async transaction => {
                await transaction.remove(User, user);
            });

            res.sendStatus(200);

        } catch(error) {
            next(error);
        }
    });


/*                              API - DATA SOURCE                             */

    app
    .route("/datasources")
    .get(async (req, res, next) => {
        try {
            const user = await getUser((req.user as User).id);

            const dataSources = await dataSourcesRepository.find({
                where: {owner: user}
            });

            res.json(dataSources);
        } catch (error) {
            next(error);
        }
    })
    .post(async (req, res, next) => {
        try {
            const user = await getUser((req.user as User).id);

            // Contrói a Data Source e também atribui o usuário logado como o
            // proprietário.
            let dataSource = new DataSource();
            dataSource = dataSourcesRepository.merge(dataSource, req.body, {
                owner: user,
            });

            const dataSourceErrors = await validate(dataSource);

            if (dataSourceErrors.length > 0)
                throw dataSourceErrors.map(error => error.constraints);

            await connection.transaction(async transation =>
                transation.insert(DataSource, dataSource));

            res.json(dataSource);
        } catch (error) {
            next(error);
        }
    });

    app
    .route("/datasources/:id")
    .get(async (req, res, next) => {
        const user = await getUser((req.user as User).id);

        const dataSourceID = parseInt(req.params.id);
        const dataSource = await dataSourcesRepository.findOne(dataSourceID, {
            where: {owner: user}
        });
        try {
            res.json(dataSource);
        } catch (error) {
            next(error);
        }
    })
    .put(async (req, res, next) => {
        try {
            const user = await getUser((req.user as User).id);

            // Busca os dados da Data Source e atualiza os dados com os dados
            // provenientes da request.
            const dataSourceID = parseInt(req.params.id);

            let dataSource = await dataSourcesRepository.findOne(dataSourceID,
                {where: {owner: user}});

            dataSource = dataSourcesRepository.merge(dataSource, req.body);

            // Valida os dados.
            const dataSourceErrors = await validate(dataSource);

            // Se houver erros de validação, emita um erro.
            if (dataSourceErrors.length > 0)
                throw dataSourceErrors.map(error => error.constraints);

            await connection.transaction(async transaction =>
                await transaction.update(DataSource, dataSourceID, dataSource));

            // Retorne para o usuário os dados atualizados.
            res.json(dataSource);
        } catch (error) {
            next(error);
        }
    })
    .delete(async (req, res, next) => {
        const user = await getUser((req.user as User).id);

        const dataSourceID = parseInt(req.params.id);
        const dataSource = await dataSourcesRepository.findOne(dataSourceID, {
            where: {owner: user}
        });

        try {
            await connection.transaction(async transaction =>
                await transaction.remove(DataSource, dataSource));

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });

/*                                 API - CHART                                */
    app
    .route("/charts")
    .get(async (req, res, next) => {
        try {
            const user = await getUser((req.user as User).id);

            // Retorna os Chart que pertence ao usuário logado. Os Charts são
            // retornados já com as Data Source.
            const charts =
                await chartsRepository.find({
                    relations: ["dataSources"],
                    where: {owner: user},
                });

            res.status(200).json(charts);
        } catch (error) {
            next(error);
        }
    })
    .post(async (req, res, next) => {
        try {
            const user = await getUser((req.user as User).id);

            // As Data Source vêm apenas com os IDs, portanto devem ser
            // transformadas nos objetos correspondentes.
            if ("dataSources" in req.body) {
                req.body.dataSources =
                    await convertToDataSource(req.body.dataSources, user);
            }

            let chart = new Chart();
            // O Chart recebe os dados a partir do body e o usuário ao qual ele
            // pertence é obtido através do ID da sessão.
            chart = chartsRepository.merge(chart, req.body, {owner: user});

            // Valida os dados.
            const chartErrors = await validate(chart);

            if (chartErrors.length > 0)
                throw chartErrors.map(error => error.constraints);

            await  connection.transaction(async transaction =>
                await transaction.save(Chart, chart));

            // Envia os dados do chart inserido juntamente com o usuário associ-
            // ado.
            res.json(chart);

        } catch (error) {
            next(error);
        }
    });


    app
    .route("/charts/:id")
    .get(async (req, res, next) => {
        try {
            const user = await getUser((req.user as User).id);

            const cid = parseInt(req.params.id);
            const chart = await chartsRepository.findOne(cid, {
                relations: ["dataSources"],
                where: {owner: user}
            });

            res.json(chart);
        } catch (error) {
            next(error);
        }
    })
    .put(async (req, res, next) => {
        try {
            const user = await getUser((req.user as User).id);

            // Busca os dados do Chart.
            const cid = parseInt(req.params.id);
            let chart = await chartsRepository.findOne(cid, {
                where: {owner: user}
            });

            // Troca os IDs das Data Source por uma instância DataSource.
            if ("dataSources" in req.body) {
                req.body.dataSources =
                    await convertToDataSource(req.body.dataSources, user);
            }

            // Atualiza e valida  os dados do Chart.
            chart = chartsRepository.merge(chart, req.body);

            const chartErrors = await validate(chart);

            // Verifica se há erros nos dados.
            if (chartErrors.length > 0)
                throw chartErrors.map(error => error.constraints);

            await connection.transaction(async transation =>
                await transation.save(chart));

            res.json(chart);

        } catch(error) {
            next(error);
        }
    })
    .delete(async (req, res, next) => {
        try {
            const user = await getUser((req.user as User).id);

            const chartID = parseInt(req.params.id);
            const chart = await chartsRepository.findOne(chartID, {
                where: {owner: user}
            });

            await connection.transaction(async transaction =>
                await transaction.remove(Chart, chart));

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });


/* ────────────────────────────────────────────────────────────────────────── */
    app.use((error, req, res: express.Response, next) => {
        if (res.headersSent)
            next(error);

        if ("code" in error && "message" in error) {

            res.status(400).json({
                code: error.code,
                message: error.message
            });
        } else {
            res.sendStatus(400);
        }
    });

    app.listen(PORT, _ => {
        console.log(`Server running on port ${PORT}.`);
    });



})
.catch(console.log);
