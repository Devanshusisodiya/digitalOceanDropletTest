const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})
const router = require('express').Router()
const Word = require('../models/word')
const Question = require('../models/question')

// route to get all words
router.get('/getAllWords', async (req, res)=>{
    const words = await Word.find()
    // let w = []

    // this is a bit more complex processing
    // to increase the number of words to a point
    // that it becomes hard to handle the json data
    // 60,000 words make 38MB of data
    // this suggests that another way must employed to load the 
    // data to the frontend 
    // for(var i = 0; i < 15000; i++){
    //     words.forEach((i)=>{
    //         w.push(i)
    //     })
    // }
    // console.log(w.length)
    res.status(200).json({words: words})
})

// route to get words based on user type
router.get('/getWordsForUser', async (req, res)=>{
    // getting the username from request body
    const username = req.body.username
})

// route to get n words from the word requested
router.get('/getFurtherWords', async (req, res)=>{
    // getting the pivot word from the
    // request body
    const pivotWord = req.body.word
    // getting the id of the pivot word
    const pivotId = await Word.findOne(
        { word: {$eq : pivotWord} },
        { _id: 1}
    )
    // getting the next n words from the 
    // pivot word for partial processing
    const n = 2
    const further = await Word.find(
        { _id: { $gt: pivotId} }
    ).limit(n)
    // sending the response
    res.json(further)
})

// route to get questions for evaluation
router.get('/getQuestions', async (req, res)=>{
    // getting total number of words
    const numWords = await Word.count({})
    // getting all ids
    const ids = await Word.find(
        {}, 
        {
            _id: 1, 
            word: 1, 
            meaning: 1
        })
    // the number of questions that are requested
    let numQues = req.body.numQues
    // defining index var
    var index = Number()
    // defining id var
    var id = Object()
    // creating an empty array for storing the 
    // random indices required to query
    var idsToQuery = Array()
    // getting random ids, all different 
    while(idsToQuery.length < numQues){
        // getting a random index
        index = Math.round(Math.random()*(numWords-1))
        id = ids[index]._id
        // checking to see if the id has already been
        // considered, if not then storing that id
        if(idsToQuery.indexOf(id) === -1){
            idsToQuery.push(id)
        }
    }
    // querying the words
    const words = await Word.find(
        {
            _id: {$in: idsToQuery}
        },
        {
            _id: 1,
            word: 1,
            meaning: 1
        })
    // function to get options for the questions
    function getOptions(target, words){
        var options = Array()
        while(options.length < 3){
            var randIndex = Math.round(Math.random()*(numWords-1))
            if(options.indexOf(words[randIndex].word) === -1 && words[randIndex].word !== target.word){
                options.push(words[randIndex].word)
            }
        }
        return options
    }
    // defining the question list
    var quesList = Array()
    // have to create the questionnaire data now
    for(var i in words){
        const currWord = words[i]
        var options = getOptions(currWord, ids)
        const ques = new Question(
            currWord.meaning,
            currWord.word,
            options
        )
        quesList.push(ques)
    }
    // sending the response
    res.json(quesList)

})

module.exports = router