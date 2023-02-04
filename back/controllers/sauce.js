const Sauce = require('../models/Sauce')

const fs = require('fs');

//Créer une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id; //suppression faux id envoyé par le front
    delete sauceObject._userId; //suppressuion de l'id pour utiliser l'userId qui vient du token d'utilisation

    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => 
            res.status(201).json({ message: 'Sauce ajoutée avec succés' })
        )
        .catch(error => 
            res.status(400).json({error})
        );
};

/*récuperer une sauce spécifique*/
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => 
            res.status(200).json(sauce)
        )
        .catch(error => 
            res.status(404).json({ error })
        );
};

/*pour récuperer toutes les sauces*/
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => 
            res.status(200).json(sauces)
        )
        .catch(error => 
            res.status(400).json({ error })
        );
};

/*Modifier/mettre à jour une sauce*/

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId; //mesure de sécurité pour éviter qu'un user crée une sauce à la place de quelqu'un d'autre

    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message : 'Non autorisé !'});
            } 
            else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                    .then(() => 
                        res.status(200).json({message : 'Sauce mise à jour'})
                    )
                    .catch(error => 
                        res.status(401).json({ error })
                    );
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

/*Supprimer une sauce*/

exports.deleteSauce =  (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Non autorisé !'});
                } 
            else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { 
                            res.status(200).json({message: 'Sauce supprimé !'})
                        })
                        .catch(error => 
                            res.status(401).json({ error })
                        );
                });
            }
        })
        .catch( error => {
            console.log(error);
            res.status(500).json({ error });
        });
};

/*Like ou dislike une sauce*/

exports.likeSauce =  (req, res, next) => {
    //chercher object dans base de données
    Sauce.findOne({_id: req.params.id})
        .then(sauce =>{
            /* like = 1 donc 1 vote like*/
            //Si userliked n'est pas dans userId de body et que like +1
            if(!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1){
            Sauce.updateOne({_id: req.params.id},{
                $inc: {likes: 1}, 
                $push: {usersLiked: req.body.userId}
                })
                .then(() => 
                    res.status(200).json({message: 'Sauce liked !'}
                ))
                .catch(error => 
                    res.status(401).json({ error })
                ); 
            }

            /*like = 0 (le like est enlevé)*/
            //si le usersliked est dans userId de body et qu'il retire son like
            if(sauce.usersLiked.includes(req.body.userId) && req.body.like === 0){
                Sauce.updateOne({_id: req.params.id},{
                    $inc: {likes: -1}, 
                    $pull: {usersLiked: req.body.userId}
                })
                .then(() => 
                res.status(200).json({message: 'Sauce like enlevé!'}
                ))
                .catch(error => 
                    res.status(401).json({ error })
                ); 
            }

            /*Dislike = +1 donc 1 dislike*/
            if(!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1){
                Sauce.updateOne({_id: req.params.id},{
                    $inc: {dislikes: 1}, 
                    $push: {usersDisliked: req.body.userId}
                    })
                    .then(() => 
                        res.status(200).json({message: 'Sauce disliked !'}
                    ))
                    .catch(error => 
                        res.status(401).json({ error })
                    ); 
                }

                /*dislike = 0, le dislike est enlevé*/
                if(sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0){
                    Sauce.updateOne({_id: req.params.id},{
                        $inc: {dislikes: -1}, 
                        $pull: {usersDisliked: req.body.userId}
                    })
                    .then(() => 
                    res.status(200).json({message: 'Sauce dislike enlevé!'}
                    ))
                    .catch(error => 
                        res.status(401).json({ error })
                    ); 
                }
    })
        .catch( error => {
            console.log(error);
            res.status(500).json({ error });
        });
}