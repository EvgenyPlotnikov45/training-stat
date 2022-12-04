const { getNotionData } = require("./utils/get-notion-data");

module.exports = async function(data) {
    const exircises = await getNotionData();

    return Object.entries(exircises).map(([exerciseName, amounts]) => {
        const pieces = [
            `<h2>${exerciseName}</h2>`,
            `<p>Начальное количество повторений: ${amounts[0]}</p>`,
            `<p>Последнее количество повторений: ${amounts[amounts.length - 1]}</p>`,
            `<p>Относительные изменения:</p>`
        ];

        for (let i = 1; i < amounts.length; i++) {
            const prevAmount = amounts[i - 1];
            const amount = amounts[i];
            const percent = (amount / prevAmount) * 100 - 100;

            pieces.push(`<span>${percent >= 0 ? '+' : '-'}${percent.toFixed(2)}%</span>`);
        }

        const globalPercent = (amounts[amounts.length - 1] / amounts[0]) * 100 - 100;

        pieces.push(
            `<p>Прогресс за всё время: ${globalPercent >= 0 ? '+' : '-'}${globalPercent.toFixed(2)}%</p>`
        );

        return `<div>${pieces.join('')}</div>`
    }).join('');
};