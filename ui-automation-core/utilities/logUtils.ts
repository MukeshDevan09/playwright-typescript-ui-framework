import winston, { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import moment from 'moment'

let startTime: any
let endTime: any

const logTime = (): string => {
  const now = moment().format('YYYY-MM-DD HH:mm:ss')
  return now
}

const testStartTime = (): string => {
  startTime = logTime()
  return startTime
}

const testEndTime = (): string => {
  endTime = logTime()
  return endTime
}

const currentTime = moment().format('HH.mm.ss')

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp }) => {
    return `${level.toUpperCase()}: [${timestamp as string}] ${message as string}`
  })
)

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: 'logs/application-%DATE% ' + ' ' + currentTime + '.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
})

const logTestStart = (): void => {
  logger.info('=============================================================================================')
  logger.info('TESTING STARTED AT: ' + testStartTime())
  logger.info('=============================================================================================')
}

const logTestCaseStart = (scenario: string, tags: any, featureFileName: string): void => {
  logger.info('********************************************************************************************')
  logger.info('SCENARIO EXECUTION STARTED AT: ' + testStartTime())
  logger.info('STARTED EXECUTION OF SCENARIO: ' + scenario)
  logger.info('Tags: ' + String(tags))
  logger.info('Filename: ' + featureFileName)
  logger.info('********************************************************************************************')
}

const logBeforeTestStep = (step: string): void => {
  logger.info('EXECUTING STEP: ' + step)
}

const logAfterTestStep = (step: string, status: string, error: any): void => {
  logger.info('AFTER STEP: ' + step + ' ' + 'STATUS: ' + status)
  if (status === 'FAILED') {
    logger.error(error.message)
  }
}

const logTestCaseEnd = (scenario: string, duration: any): void => {
  logger.info('--------------------------------------------------------------------------------------------')
  logger.info('SCENARIO EXECUTION ENDED AT : ' + testEndTime())
  const timeDiffInSeconds = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
  logger.info('TIME TAKEN FOR SCENARIO EXECUTION: ' + String(timeDiffInSeconds) + '  seconds')
  logger.info('--------------------------------------------------------------------------------------------')
  logger.info('ENDED EXECUTION OF SCENARIO: ' + scenario)
  logger.info('--------------------------------------------------------------------------------------------')
}

const logTestEnd = (): void => {
  logger.info('=============================================================================================')
  logger.info('TESTING ENDED AT : ' + testEndTime())
  logger.info('=============================================================================================')
}

export { logger, logTestStart, logTestCaseStart, logBeforeTestStep, logAfterTestStep, logTestCaseEnd, logTestEnd }
