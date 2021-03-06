let RandomizationUtils = {
    // shuffle array in place, taken from: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array/6274381#6274381
    shuffle: (a) => {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    },
    CoinToss: () => Math.floor(Math.random() * 2) == 1,
    RandomFromZero: max => Math.floor(Math.random() * max),
    RandomNumberBetweenMinMaxInclusive: (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
};