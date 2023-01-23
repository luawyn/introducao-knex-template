import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// Prática 1 : 

// Crie dentro da pasta src/database o arquivo knex.ts
// Referencie o material assíncrono 
// (e lembre-se de editar o nome do caminho para o arquivo .db)

// Para garantir que está tudo certo, crie um endpoint
// que busca pelas bandas na tabela bands utilizando queries no formato
//  raw

app.get("/bands", async (req: Request, res: Response) => {
    try {
         const result = await db.raw(`
                SELECT * FROM bands;        
         `)
    res.status(200).send({bandas: result})
    } catch (error) {
        console.log(error)
        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// Agora crie um endpoint que insere uma nova banda na tabela bands
// Lembre-se de validar os dados de entrada para não estressar 
// a conexão com o banco de dados desnecessariamente

app.post("/bands", async (req: Request, res: Response) =>{

    try {
        const {id,name} = req.body
        if(typeof id !== "string"){
            res.status(400)
            throw new Error("'id' inválido, deve ser uma string");
          }
          if(typeof name !== "string"){
            res.status(400)
            throw new Error("'name' inválido, deve ser uma string");
          }
          if(id.length <1 || name.length <1){
            res.status(400)
            throw new Error("'id' ou 'name' devem ter no minímo 1 caractere ");
            }
            await db.raw(`
            INSERT INTO bands (id,name) 
            VALUES ("${id}","${name}");
            `)

            res.status(200).send(`${name} cadastrada com sucesso`)
    } catch (error:any) {
        console.log(error.message)
        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//Prática 03 :
// Dessa vez implemente o endpoint de edição de bandas na tabela bands
// Lembre-se de referenciar o material assíncrono,
//  existe um exemplo de PUT nele

app.put("/bands/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        //b003

        const newId = req.body.id   //b123
        const newName = req.body.name //RockBand
       
        if (newId !== undefined) {

            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("'id' deve ser string")
            }

			if (newId.length < 1) {
                res.status(400)
                throw new Error("'id' deve possuir no mínimo 1 caractere")
            }
        }

        if (newName !== undefined) {

            if (typeof newName !== "string") {
                res.status(400)
                throw new Error("'name' deve ser string")
            }

            if (newName.length < 2) {
                res.status(400)
                throw new Error("'name' deve possuir no mínimo 2 caracteres")
            }
        }

       // verificamos se o user a ser editado realmente existe
        
        const [band]  = await db.raw(`
					SELECT * FROM bands
					WHERE id = "${id}";
				`) // desestruturamos para encontrar o primeiro item do array

                console.table(band)
				// se existir, aí sim podemos editá-lo
        if (band) {
						await db.raw(`
							UPDATE bands
							SET
								id = "${newId || band.id}",
								name = "${newName || band.name}"
							WHERE
								id = "${id}";
						`)

        } else {
            res.status(404)
            throw new Error("'id' não encontrada")
        }

        res.status(200).send({ message: "Atualização realizada com sucesso" })
    
    } catch (error:any) {
        console.log(error.message)
        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})