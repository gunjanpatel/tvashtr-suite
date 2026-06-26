import { GoogleSheetsCategoryRepository } from '@tvashtr/google-sheets'
import { createSheetPlugin } from '../utils/createSheetPlugin'

export default createSheetPlugin({
  configKey:     'categorySheetId',
  provideKey:    'categories',
  emptyValue:    [],
  warnIfMissing: true,
  makeRepo:      (sheetId) => new GoogleSheetsCategoryRepository(sheetId),
})
