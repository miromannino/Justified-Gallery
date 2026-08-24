import { LastRowModes } from './settings';

export interface BuildingRow {
  entriesBuff: HTMLElement[];
  aspectRatio: number;
  width: number;
  height: number;
}

export interface RowLayoutContext {
  galleryWidth: number;
  border: number;
  margins: number;
  justifyThreshold: number;
  rowHeight: number;
  lastRow: LastRowModes;
  rows: number;
  offY: number;
}

/**
 * Clears the building row data to be used for a new row
 */
export function clearBuildingRow(row: BuildingRow): void {
  row.entriesBuff = [];
  row.aspectRatio = 0;
  row.width = 0;
}

/**
 * Justifies the building row, preparing it to display.
 *
 * @param row - The row being built, mutated in place with the computed
 * `jgJwidth`/`jgJheight` dataset attributes on its entries and its final
 * `height`.
 * @param ctx - The gallery settings/state needed to compute the layout.
 * @param isLastRow - Indicates if this is the last row
 * @param hiddenRow - `undefined` or `false` for normal behavior.
 *                    `true` to hide the row
 * @returns `-1` if the row has been hidden, otherwise `true`/`false`
 * indicating whether the row has been justified.
 */
export function prepareBuildingRow(
  row: BuildingRow,
  ctx: RowLayoutContext,
  isLastRow: boolean,
  hiddenRow?: boolean
): number | boolean {
  let justify = true;
  let minHeight = 0;

  let availableWidth =
    ctx.galleryWidth - 2 * ctx.border - (row.entriesBuff.length - 1) * ctx.margins;
  const rowHeight = availableWidth / row.aspectRatio;
  let defaultRowHeight = ctx.rowHeight;
  const justifiable = row.width / availableWidth > ctx.justifyThreshold;

  if (hiddenRow || (isLastRow && ctx.lastRow === 'hide' && !justifiable)) {
    row.entriesBuff.forEach((entry) => {
      entry.classList.remove('jg-entry-visible');
    });
    return -1;
  }

  if (
    isLastRow &&
    !justifiable &&
    ctx.lastRow !== 'justify' &&
    ctx.lastRow !== 'hide'
  ) {
    justify = false;

    if (ctx.rows > 0) {
      defaultRowHeight = (ctx.offY - ctx.border - ctx.margins * ctx.rows) / ctx.rows;
      justify = (defaultRowHeight * row.aspectRatio) / availableWidth > ctx.justifyThreshold;
    }
  }

  row.entriesBuff.forEach((entry, i) => {
    const imgAspectRatio =
      parseFloat(entry.dataset.jgWidth ?? '0') /
      parseFloat(entry.dataset.jgHeight ?? '1');

    let newImgW: number;
    let newImgH: number;

    if (justify) {
      newImgW =
        i === row.entriesBuff.length - 1 ? availableWidth : rowHeight * imgAspectRatio;
      newImgH = rowHeight;
    } else {
      newImgW = defaultRowHeight * imgAspectRatio;
      newImgH = defaultRowHeight;
    }

    availableWidth -= Math.round(newImgW);
    entry.dataset.jgJwidth = Math.round(newImgW).toString();
    entry.dataset.jgJheight = Math.ceil(newImgH).toString();

    if (i === 0 || minHeight > newImgH) minHeight = newImgH;
  });

  row.height = minHeight;
  return justify;
}
