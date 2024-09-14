import { type Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import pixelmatch from 'pixelmatch'
import * as PNG from 'pngjs'
import { logger } from '../utilities/logUtils'

const settings = {
  reportPath: path.join(__dirname, '..', '..', 'reports', 'visual-tests'),
  baselineDir: 'baseline',
  currentDir: 'current',
  diffDir: 'diff',
  threshold: 0.1
}

const createDirectories = (): void => {
  for (const dir of [settings.baselineDir, settings.currentDir, settings.diffDir]) {
    const dirPath = path.join(settings.reportPath, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
}

createDirectories()

/**
 * Create baseline image
 * @param page - Playwright page object to run the visual tests on
 * @param testName - Name of the image file to be saved
 * @param timeout - Timeout to wait before taking the screenshot(default: 2000)
 * @returns Promise<void>
*/
export async function createBaselineImage (page: Page, testName: string, timeout = 2000): Promise<void> {
  try {
    const currentDate = new Date().toISOString().split('T')[0]
    const baselineImage = path.join(settings.reportPath, settings.baselineDir, `${testName}-baseline.png`)
    const currentImage = path.join(settings.reportPath, settings.currentDir, `${testName}-current-${currentDate}.png`)

    await page.waitForTimeout(timeout)

    await captureScreenshot(page, `${testName}-current-${currentDate}.png`)

    logger.info(`No baseline image found for ${testName}. Saving the current screenshot as baseline.`)
    fs.copyFileSync(currentImage, baselineImage)
  } catch (error) {
    logger.error('Error while creating baseline image: ' + String(error))
  }
}

export async function captureScreenshot (page: Page, filename: string): Promise<void> {
  try {
    const screenshotPath = path.join(settings.reportPath, settings.currentDir, filename)
    await page.screenshot({ path: screenshotPath })
    logger.info('Successfully captured screenshot: ' + filename)
  } catch (error) {
    logger.error('Error while capturing screenshot: ' + String(error))
    throw error
  }
}

export async function compareScreenshots (
  image1: string,
  image2: string,
  diffImage: string
): Promise<boolean> {
  try {
    const img1 = PNG.PNG.sync.read(fs.readFileSync(image1))
    const img2 = PNG.PNG.sync.read(fs.readFileSync(image2))
    const { width, height } = img1

    const diff = new PNG.PNG({ width, height })

    const options = {
      threshold: settings.threshold
    }

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, options)

    fs.writeFileSync(diffImage, PNG.PNG.sync.write(diff))

    return numDiffPixels === 0
  } catch (error) {
    logger.error('Error while comparing screenshots: ' + String(error))
    return false
  }
}

/**
 * Run visual tests
 * @param page - Playwright page object to run the visual tests on
 * @param testName - Name of the image file to be saved
 * @param timeout - Timeout to wait before taking the screenshot(default: 2000)
 * @returns Promise<void>
*/
export async function runVisualTests (page: Page, testName: string, timeout = 2000): Promise<void> {
  try {
    const currentDate = new Date().toISOString().split('T')[0]
    const baselineImage = path.join(settings.reportPath, settings.baselineDir, `${testName}-baseline.png`)
    const currentImage = path.join(settings.reportPath, settings.currentDir, `${testName}-current-${currentDate}.png`)
    const diffImage = path.join(settings.reportPath, settings.diffDir, `${testName}-diff-${currentDate}.png`)

    if (!fs.existsSync(baselineImage)) {
      await createBaselineImage(page, testName)
    } else {
      await page.waitForTimeout(timeout)
      await captureScreenshot(page, `${testName}-current-${currentDate}.png`)
      const isIdentical = await compareScreenshots(baselineImage, currentImage, diffImage)

      if (!isIdentical) {
        logger.error(`Visual difference detected for ${testName}. Check ${diffImage} for differences.`)
      }
    }
  } catch (error) {
    logger.error('Error while running visual tests: ' + String(error))
  }
}
