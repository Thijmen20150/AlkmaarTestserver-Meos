// Voeg hier je achtergrondafbeeldingen toe
const backgrounds = [
    'https://cdn.discordapp.com/attachments/1381981725307174942/1385267404564856863/Dienst.png?ex=6855724e&is=685420ce&hm=29e33226d566ee50e8e37a0a48610fd3327a0cc95e6b01ed466f00faf06daeb7&',
    'https://cdn.discordapp.com/attachments/1381981725307174942/1385267405303058572/Kmar_1.png?ex=6855724e&is=685420ce&hm=51ca95b25d7c04ed1a0059f94c9b5f2c8889f7eb9fba24b719a0fcade6741654&'    // Voeg eventueel meer afbeeldingen toe
];

document.addEventListener('DOMContentLoaded', () => {
    const bgDiv = document.querySelector('.background');
    const randomImg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    bgDiv.style.backgroundImage = `url('${randomImg}')`;
});