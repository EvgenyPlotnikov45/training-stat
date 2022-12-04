import * as dotenv from 'dotenv';
import { Client } from "@notionhq/client";
import { leftPad } from './utils/left-pad.js';

dotenv.config()

const log = (item) => console.dir(item, {depth: 5});

const notion = new Client({ auth: process.env.NOTION_KEY });

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

// stat output
Object.entries(exircisesDayByDay).forEach(([exerciseName, amounts]) => {
    const pieces = [
        exerciseName + ':\n',
        leftPad(`Начальное количество повторений:`, 32), `${amounts[0]}\n`,
        leftPad(`Последнее количество повторений:`, 32), `${amounts[amounts.length - 1]}\n`,
        leftPad(`Относительные изменения:`, 32)
    ];

    for (let i = 1; i < amounts.length; i++) {
        const prevAmount = amounts[i - 1];
        const amount = amounts[i];
        const percent = (amount / prevAmount) * 100 - 100;

        pieces.push(`${percent >= 0 ? '+' : '-'}${percent.toFixed(2)}%`);
    }

    const globalPercent = (amounts[amounts.length - 1] / amounts[0]) * 100 - 100;

    pieces.push(`\n`);
    pieces.push(
        leftPad(`Прогресс за всё время:`, 32),
        `${globalPercent >= 0 ? '+' : '-'}${globalPercent.toFixed(2)}%\n`
    );

    console.log(pieces.join(' '));
});
