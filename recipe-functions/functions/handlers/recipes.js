const { admin, db } = require('../util/admin');
const config = require('../util/config');

exports.getAllDrinks =async (req,res) =>{
    await db.collection("drinks")
    .orderBy('updatedAt','desc')
    .get()
    .then(doc => {
        let recipes = []
        doc.forEach(data => {
            recipes.push({
                drinkId:data.data().id,
                type:data.data().type,
                title:data.data().title,
                method:data.data().method,
                ingredients:data.data().ingredients,
                time:data.data().time,
                imageUrl:data.data().imageUrl,
                createdAt:data.data().createdAt,
                updatedAt:data.data().updatedAt
            })
        })
        return res.status(200).json(recipes);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error:error.code});
    });
}

exports.getDrink =async (req,res) =>{
    await db.doc(`/drinks/${req.params.drinkId}`)
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({error:"Drink not found"});
            }
            let drinkData = doc.data();
            drinkData.reviews = [];
            db.collection('reviews')
                .where('drinkId','==',req.params.drinkId)
                .orderBy('createdAt','desc')
                .get()
                .then(doc => {
                    doc.forEach(data => {
                        drinkData.reviews.push({
                            userId:data.data().userId,
                            test:data.data().text,
                            stars:data.data().stars,
                            drinkId:data.data().drinkId,
                            createdAt:data.data().createdAt,
                        });
                    })
                    console.log(drinkData.reviews);
                    return res.status(200).json(drinkData)
                })
                .catch(err =>{
                    console.error(err);
                    return res.status(500).json({error:err.code});
                })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code})
        })
}

exports.getDrinksByType = async (req,res) => {
    await db.collection('drinks')
        .where('type','==',req.params.type)
        .get()
        .then(doc => {
            let recipes = []
            doc.forEach(data => {
                recipes.push({
                    drinkId:data.id,
                    type:data.data().type,
                    title:data.data().title,
                    method:data.data().method,
                    time:data.data().time,
                    image:data.data().imageUrl,
                    ingredients:data.data().ingredients,
                    createdAt:data.data().createdAt,
                    updatedAt:data.data().updatedAt
                })
            })
            return res.status(200).json(recipes);
        })
    .catch(err=>{
        console.error(err);
        res.status(500).json({error: err.code});
    })
}


exports.postDrink = async (req, res) =>{
    const noImg = 'no-img.png';
    recipe = {
        type:req.body.type,
        title:req.body.title,
        method:req.body.method,
        time:req.body.time,
        imageUrl:`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        ingredients:req.body.ingredients,
        createdAt:new Date().toISOString(),
        updatedAt:new Date().toISOString()
    }
    
    await db.collection('drinks')
        .add(recipe)
        .then(doc => {
            const resDrink = recipe;
            resDrink.drinkId = doc.id;
            return res.status(201).json(resDrink);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:"Something went wrong:"+ err.code});
        })

}
exports.uploadeImage = async (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({headers:req.headers});
    let imageToBeUploaded = {};
    let imageFileName;
    busboy.on('file',(fieldname, file, filename, encoding, mimetype) =>{
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
            return res.status(400).json({error: 'Wrong file type submitted'})
        }
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random()*10000000000)}.${imageExtension}`;
        const filePath = path.join(os.tmpdir(), imageFileName);
        
        imageToBeUploaded = { filePath,mimetype };
        file.pipe(fs.createWriteStream(filePath));
    });
    busboy.on('finish', async ()=>{
        await admin
            .storage()
            .bucket(`${config.storageBucket}`)
            .upload(imageToBeUploaded.filePath,{
                resumable: false,
                metadata: {
                    metadata:{
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(()=>{
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                return db.doc(`/drinks/${req.params.drinkId}`).update({imageUrl})
            })
            .then(()=>{
                return res.status(200).json({message:'Image uploaded successfully'});
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({error:err});
            });
    });
    busboy.end(req.rawBody);
}

exports.deleteDrink =async (req, res) => {
    await db.collection('drinks')
        .doc(req.params.drinkId)
        .delete()
        .then(() => {    
            res.status(200).json({message : 'Drink deleted successfully'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error:err.code});
        })
}

exports.editDrink = async (req,res) =>{
    await db.doc(`/drinks/${req.params.drinkId}`)
        .get()
        .then(doc => {
            return doc.ref.update({
                type:req.body.type,
                title:req.body.title,
                method:req.body.method,
                time:req.body.time,
                ingredients:req.body.ingredients,
                updatedAt:new Date().toISOString()
            })
        })
        .then(()=>{
            res.status(200).json({message:"Drink updated successfully"})
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error:err.code});
        })
}

exports.reviewDrink = async (req,res) => {
    const review = {
        userId:req.user.username,
        text:req.body.text,
        stars:req.body.stars,
        drinkId:req.params.drinkId,
        createdAt:new Date().toISOString()
    }
    console.log(review);
    await db.collection('reviews')
        .add(review)
        .then(doc => {
            const resReview = review;
            resReview.reviewId = doc.id;
            return res.status(201).json(resReview);
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error:"Something went wrong"});
        })
}