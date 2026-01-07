import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import { Blob,File } from "node:buffer";

import { PinataSDK } from "pinata";
dotenv.config();
const app = express();
app.use(express.json());

const pinata = new PinataSDK({
    pinataGateway: process.env.PINATA_GATEWAY_URL || "",
    pinataJwt: process.env.PINATA_JWT || "",
});
const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, 
    storage: multer.memoryStorage(),
});

app.post("/upload", upload.single("file"), async(req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    if(!req.body.description){
        return res.status(400).send("No description provided.");
    }
    try{
        const uint8Array = new Uint8Array(req.file.buffer);
        const blob = new Blob([uint8Array], { type: req.file.mimetype });
        const file = new File([blob], req.file.originalname, { type: req.file.mimetype });
        const imgResult = await pinata.upload.public.file(file);
        const cid = imgResult.cid;
        const metaData = await pinata.upload.public.json({
            description: req.body.description,
            image: `${cid}`,
        });
        console.log(metaData);
        res.send(metaData.cid);
    } catch(err){
        console.log("Error occured",err);
        res.status(500).send("Error uploading file.");
    }
});

app.get("/fetch/:cid",async(req,res)=>{
    const cid = req.params.cid;
    try{
        const result = await pinata.gateways.public.get(cid);
        console.log(result);
        res.send(result);
    } catch(err){
        res.status(500).send("Error fetching file.");
    }
});

app.listen(process.env.PORT, async() => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
