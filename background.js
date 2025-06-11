// Voeg hier je achtergrondafbeeldingen toe
const backgrounds = [
    'https://cdn.discordapp.com/attachments/1378245756179185776/1378245817822871595/Kmar_1.png?ex=683be6f1&is=683a9571&hm=e6f5174dea07df12cdea695fb17f13385ed506c103cd3b617319e18c4242fca5&',
    // Voeg eventueel meer afbeeldingen toe
];

document.addEventListener('DOMContentLoaded', () => {
    const bgDiv = document.querySelector('.background');
    const randomImg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    bgDiv.style.backgroundImage = `url('${randomImg}')`;
});