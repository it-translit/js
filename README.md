# IT-транслит

Реализация на JavaScript.

Получена преобразованием [реализации на Python](https://github.com/it-translit/py) посредством [codeconvert.ai](https://codeconvert.ai).

## Использование

```js
const it_translit = require('it_translit');

let r = it_translit.trans('транслит');

console.log(r);
console.log(it_translit.reverse(r));
```
