const mongoose = require('mongoose');

//Schéma de données qui contient les champs souhaités pour chaque Sauces
const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageURL: { type: String, required: true }, 
    heat: { type: Number, require: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: ["String <userId>"]},
    usersDisliked: { type: ["String <userId>"] },
});

//Exportation du shéma de données en tant que modèle Mongoose
//il sera du coup dispo pour l'appli Express
module.exports = mongoose.model('Sauce', sauceSchema);