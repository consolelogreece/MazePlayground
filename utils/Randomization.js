// shuffle array in place, taken from: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array/6274381#6274381
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

let CoinToss = () => Math.floor(Math.random() * 2) == 1;

let RandomNumberBetweenMinMaxInclusive = (min, max) => Math.floor(Math.random() * (max - min) + 1) + min; 