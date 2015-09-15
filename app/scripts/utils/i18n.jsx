import store from 'store';
import _ from 'underscore';
import React from 'react/addons';

let languages = [
  {
    locale: 'fr',
    trad: require("json!../../i18n/fr.json")
  }
];

let locale = store.get('locale') || window.navigator.userLanguage || window.navigator.language;

// Si on ne trouve pas le language --> locale = en
let language = _.findWhere(languages, {locale: locale});

// if (!store.get('locale')) {
store.set('locale', locale)
// }

let __ = function(m, forceString) {
  if (language) m = language.trad[m];
  if (forceString)
    return m;
  else
    return <span dangerouslySetInnerHTML={{__html:m}} ></span>;
}

export default __;
