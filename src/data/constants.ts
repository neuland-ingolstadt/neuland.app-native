export const PRIVACY_URL = 'https://next.neuland.app/legal/privacy'
export const IMPRINT_URL = 'https://next.neuland.app/legal/imprint'
export const STATUS_URL = 'https://status.neuland.app/status/app'
export const USER_STUDENT = 'student'
export const USER_EMPLOYEE = 'employee'
export const USER_GUEST = 'guest'
const primussLink = 'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
const moodleLink = 'https://moodle.thi.de/'
const mailLink = 'https://outlook.office.com/'
const studverLink = 'https://studverthi.de'
const marketplaceLink = 'https://www.thi.de/service/marketplace/'
const libraryLink = 'https://opac.ku.de/index-hi.html'
const thiLink = 'https://www.thi.de'
const pressReaderLink =
    'https://thi.idm.oclc.org/login?url=https://www.pressreader.com/catalog'

export const quicklinks = [
    {
        key: 'primuss',
        url: primussLink,
        icon: {
            ios: 'graduationcap',
            android: 'school',
            web: 'GraduationCap',
        },
    },
    {
        key: 'moodle',
        url: moodleLink,
        icon: {
            ios: 'tray.full',
            android: 'note_stack',
            web: 'FolderOpen',
        },
    },
    {
        key: 'webmail',
        url: mailLink,
        icon: {
            ios: 'envelope',
            android: 'mail',
            web: 'Mail',
        },
    },
    {
        key: 'studVer',
        url: studverLink,
        icon: {
            ios: 'person.bubble',
            android: '3p',
            web: 'CircleUser',
        },
    },
    {
        key: 'THI',
        url: thiLink,
        icon: {
            ios: 'globe',
            android: 'captive_portal',
            web: 'Globe',
        },
    },
    {
        key: 'marketplace',
        url: marketplaceLink,
        icon: {
            ios: 'cart',
            android: 'shopping_cart',
            web: 'ShoppingCart',
        },
    },
    {
        key: 'library',
        url: libraryLink,
        icon: {
            ios: 'text.book.closed',
            android: 'book_4',
            web: 'BookOpenText',
        },
    },
    {
        key: 'press',
        url: pressReaderLink,
        icon: {
            ios: 'newspaper',
            android: 'newspaper',
            web: 'Newspaper',
        },
    },
]

export const defaultQuicklinks = ['primuss', 'moodle', 'webmail']
