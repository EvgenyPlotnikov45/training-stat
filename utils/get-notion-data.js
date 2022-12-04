const dotenv = require('dotenv');
const { Client } = require('@notionhq/client');

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY });

async function getNotionData() {
    const trainingPage = await notion.pages.retrieve({
        page_id: '4b5adf793d5a42c2b5e107a657584be0',
    });
    const blockId = trainingPage?.id;

    const blocksResponse = await notion.blocks.children.list({
        block_id: blockId
    })

    const blocksList = blocksResponse.results.filter(item => item.type === 'child_database');

    const collectedTrainingData = [];

    for (let block of blocksList) {
        const blockId = block.id;

        const databaseResp = await notion.databases.query({
            database_id: blockId
        });
        let properties = {};

        databaseResp.results.forEach(item => {
            Object.entries(item.properties).filter(prop => prop[1].type === 'number').forEach(([key, prop]) => {
                if (!properties[key]) properties[key] = 0;

                properties[key] += prop.number;
            });
        })

        collectedTrainingData.push(properties);
    }

    const exircisesDayByDay = {};

    collectedTrainingData.forEach(trainingDay => {
        Object.entries(trainingDay).forEach(([exerciseNameRaw, amount]) => {
            const exerciseName = exerciseNameRaw.replace('\n', '');

            if (!exircisesDayByDay[exerciseName]) exircisesDayByDay[exerciseName] = [];

            exircisesDayByDay[exerciseName].push(amount);
        });
    });

    return exircisesDayByDay;
}

module.exports = {
    getNotionData
};
