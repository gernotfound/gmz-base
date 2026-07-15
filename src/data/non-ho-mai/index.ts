import { dataHot } from './data_hot';
import { dataLove } from './data_love';
import { dataSituazioni } from './data_situazioni';
import { dataImbarazzo } from './data_imbarazzo';
import { dataSocial } from './data_social';
import { dataConfini } from './data_confini';

export const categoriesData: Record<string, string[]> = {
  Hot: dataHot,
  Love: dataLove,
  Situazioni: dataSituazioni,
  Imbarazzo: dataImbarazzo,
  Social: dataSocial,
  Confini: dataConfini
};
