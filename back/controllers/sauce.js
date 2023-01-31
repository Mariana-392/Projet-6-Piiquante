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
        imageURL: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
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
                res.status(401).json({ message : 'Non autorisé !'});
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
    console.log("bjr");
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Non autorisé !'});
                } 
            else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { 
                            res.status(200).json({message: 'Sauce supprimé !'})})
                        .catch(error => 
                            res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

/*Like ou dislike une sauce*/