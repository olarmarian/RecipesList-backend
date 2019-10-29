const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipes');
    

// router.get('/', async (req,res)=>{
//     try{
//         const posts = await Recipe.find();
//         res.status(200).json(posts);
//     }catch(err){
//         res.status(404).json({message:err})
//     }
// });

router.route('/').get((req,res)=>{
    Recipe.find()
        .then(recipes => res.status(200).json(recipes))
        .catch(err => {
            console.error(err);
            res.status(400).json('Error: '+err);
        });
})

router.route('/:title').get((req,res) => {
    Recipe.find()
        .where({type:req.params.title})
        .then(recipe => {
            res.status(200).json(recipe);
        })
        .catch(err=>{
            console.error(err);
            res.status(400).json('Error: '+err);
        })
})

router.route('/type/:type').get((req,res)=>{
    Recipe.find()
        .where({type:req.params.type})
        .then(recipe=>res.status(200).json(recipe))
        .catch(err => {
            console.error(err);
            res.status(404).json({message:"Not found"})
        })
})

router.route('/add').post(async (req,res)=>{
    const recipe = new Recipe({
        title : req.body.title,
        type: req.body.type,
        method: req.body.method,
        ingredients: req.body.ingredients
    });
    recipe.save()
        .then(()=>res.status(200).json('Recipe added!'))
        .catch(err=>{
            console.error(err);
            res.status(500).json('Error: '+err);
        });
});


router.route('/:id').delete((req,res) => {
    Recipe.findByIdAndDelete(req.params.id)
        .then(() => res.status(200).json('Recipe deleted!'))
        .catch(err=> {
            console.error(err);
            res.status(404).json({message:"Not found"});
        });
})

router.route('/edit/:id').post((req,res) =>{
    Recipe.findById(req.params.id)
        .then(recipe =>{
            recipe.title = req.body.title;
            recipe.method = req.body.method;
            recipe.ingredients = req.body.ingredients;
            recipe.type = req.body.type;
            recipe.save()
                .then(()=>res.status(200).json('Recipe updated!'))
                .catch(err => {
                    console.error(err);
                    res.status(404).json({message:"Not found"})}
                );
        })
        .catch(err => res.status(500).json('Error: ' + err));
    });

module.exports = router;