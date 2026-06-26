import { GoogleSheetsRecipeRepository } from '@tvashtr/google-sheets'
import { createSheetPlugin } from '../utils/createSheetPlugin'

export default createSheetPlugin({
  configKey:     'recipeSheetId',
  provideKey:    'recipes',
  emptyValue:    [],
  needsImages:   true,
  warnIfMissing: true,
  makeRepo:      (sheetId, optimizedImages) =>
    new GoogleSheetsRecipeRepository(sheetId, optimizedImages!),
})
