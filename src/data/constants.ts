export const PRIVACY_URL =
    'https://assets.neuland.app/datenschutzerklaerung-app-v2.htm'
export const IMPRINT_URL = 'https://assets.neuland.app/impressum-app.htm'
export const STATUS_URL = 'https://status.neuland.app/status/app'
export const USER_STUDENT = 'student'
export const USER_EMPLOYEE = 'employee'
export const USER_GUEST = 'guest'
const primussLink = 'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
const moodleLink = 'https://moodle.thi.de/'
const mailLink = 'https://outlook.thi.de/'
const studverLink = 'https://studverthi.de'
const marketplaceLink = 'https://www.thi.de/service/marketplace/'
const myThiLink = 'https://mythi.de'
const libraryLink = 'https://opac.ku.de/index-hi.html'

export const quicklinks = [
    {
        key: 'primuss',
        url: primussLink,
        icon: {
            ios: 'graduationcap',
            android: 'school',
        },
    },
    {
        key: 'moodle',
        url: moodleLink,
        icon: {
            ios: 'tray.full',
            android: 'note_stack',
        },
    },
    {
        key: 'webmail',
        url: mailLink,
        icon: {
            ios: 'envelope',
            android: 'mail',
        },
    },
    {
        key: 'studVer',
        url: studverLink,
        icon: {
            ios: 'person.bubble',
            android: 'podium',
        },
    },
    {
        key: 'marketplace',
        url: marketplaceLink,
        icon: {
            ios: 'cart',
            android: 'shopping_cart',
        },
    },
    {
        key: 'library',
        url: libraryLink,
        icon: {
            ios: 'text.book.closed',
            android: 'book_4',
        },
    },
    {
        key: 'myTHI',
        url: myThiLink,
        icon: {
            ios: 'circle.grid.2x2',
            android: 'badge',
        },
    },
]

export const defaultQuicklinks = ['primuss', 'moodle', 'webmail']
