import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

type EntryLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  visible: boolean;
};

async function readEntries(
  page: import('@playwright/test').Page,
  id: string
): Promise<EntryLayout[]> {
  return page.$$eval(`#${id} > a`, (els) =>
    els.map((el) => {
      const style = window.getComputedStyle(el);
      return {
        left: parseFloat(style.left) || 0,
        top: parseFloat(style.top) || 0,
        width: parseFloat(style.width) || 0,
        height: parseFloat(style.height) || 0,
        visible: el.classList.contains('jg-entry-visible'),
      };
    })
  );
}

test('lastRow modes control how the final, unfilled row is displayed', async ({
  page,
}) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await waitForCompletes(page, 6);

  const galleryWidth = await page.$eval(
    '#nojustifyLastRow',
    (el) => el.clientWidth
  );

  // All six galleries share the same images, rowHeight, and default
  // margins/border, so the row composition (which entries end up in the
  // last row) is identical across all of them; only the last row's own
  // presentation differs. Use the nojustify gallery, which keeps entries at
  // their natural size, to establish the row boundaries.
  const reference = await readEntries(page, 'nojustifyLastRow');
  const lastRowTop = Math.max(...reference.map((e) => e.top));
  const beforeLastRowCount = reference.filter((e) => e.top !== lastRowTop).length;
  const lastRowCount = reference.length - beforeLastRowCount;
  expect(lastRowCount).toBeGreaterThan(0);
  expect(beforeLastRowCount).toBeGreaterThan(0);

  const border = reference[0].left; // first entry offset == border

  // justify: the last row is stretched to fill the full available width.
  const justify = await readEntries(page, 'justifyLastRow');
  const justifyLastRow = justify.slice(beforeLastRowCount);
  const justifyRowWidth =
    justifyLastRow[justifyLastRow.length - 1].left +
    justifyLastRow[justifyLastRow.length - 1].width -
    justifyLastRow[0].left;
  expect(justifyRowWidth).toBeCloseTo(galleryWidth - 2 * border, 0);

  // nojustify/left: the last row starts at the left border, unstretched.
  const nojustifyLastRow = reference.slice(beforeLastRowCount);
  expect(nojustifyLastRow[0].left).toBeCloseTo(border, 0);
  const nojustifyRowWidth =
    nojustifyLastRow[nojustifyLastRow.length - 1].left +
    nojustifyLastRow[nojustifyLastRow.length - 1].width -
    nojustifyLastRow[0].left;
  expect(nojustifyRowWidth).toBeLessThan(galleryWidth - 2 * border);

  const left = await readEntries(page, 'leftLastRow');
  const leftLastRow = left.slice(beforeLastRowCount);
  expect(leftLastRow[0].left).toBeCloseTo(border, 0);

  // center: the unstretched last row is centered horizontally.
  const center = await readEntries(page, 'centerLastRow');
  const centerLastRow = center.slice(beforeLastRowCount);
  const centerRowWidth =
    centerLastRow[centerLastRow.length - 1].left +
    centerLastRow[centerLastRow.length - 1].width -
    centerLastRow[0].left;
  const expectedCenterOffset =
    border + Math.round((galleryWidth - 2 * border - centerRowWidth) / 2);
  expect(centerLastRow[0].left).toBeCloseTo(expectedCenterOffset, 0);

  // right: the unstretched last row is flush against the right edge.
  const right = await readEntries(page, 'rightLastRow');
  const rightLastRow = right.slice(beforeLastRowCount);
  const rightEdge =
    rightLastRow[rightLastRow.length - 1].left +
    rightLastRow[rightLastRow.length - 1].width;
  expect(rightEdge).toBeCloseTo(galleryWidth - border, 0);

  // hide: rows before the last stay visible, the last row is not displayed.
  const hide = await readEntries(page, 'hideLastRow');
  hide.slice(0, beforeLastRowCount).forEach((entry) => {
    expect(entry.visible).toBe(true);
  });
  hide.slice(beforeLastRowCount).forEach((entry) => {
    expect(entry.visible).toBe(false);
  });
});
