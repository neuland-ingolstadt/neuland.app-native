import dayjs from 'dayjs'
import 'dayjs/locale/de'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default dayjs
