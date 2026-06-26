import { GoogleSheetsProductRepository } from '@tvashtr/google-sheets'
import { createSheetPlugin } from '../utils/createSheetPlugin'

export default createSheetPlugin({
  configKey:    'sheetId',
  provideKey:   'products',
  emptyValue:   [],
  needsImages:  true,
  errorKey:     'productsError',
  makeRepo:     (sheetId, optimizedImages) =>
    new GoogleSheetsProductRepository(sheetId, optimizedImages!),
})
