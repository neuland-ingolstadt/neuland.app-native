# Contributors

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/Robert27.png',
    name: 'Robert Eggl',
   logo: './assets/robert.png',
    title: 'Founder & Project Lead Neuland Next',
    links: [
      { icon: 'github', link: 'https://github.com/Robert27' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/roberteggl/' },
    ]
  },
  
    {
    avatar: 'https://github.com/BuildmodeOne.png',
    name: 'Philipp Opheys',
    title: 'Project Lead neuland.app',
    links: [
      { icon: 'github', link: 'https://github.com/BuildmodeOne' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/philipp-opheys/' },
    ]
  },
  {
    avatar: 'https://github.com/alexhorn.png',
    name: 'Alexander Horn',
    title: 'Founder of neuland.app',
    links: [
      { icon: 'github', link: 'https://github.com/alexhorn' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/alexhorn29/' },
    ]
  },
   {
    avatar: 'https://github.com/M4GNV5.png',
    name: 'Jakob Löw',
    title: 'Founder of neuland.app',
    links: [
      { icon: 'github', link: 'https://github.com/M4GNV5' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/jakob-löw-1814431b4/' },
    ]
  },
    {
    avatar: 'https://github.com/neuland-ingolstadt.png',
    name: 'and many more contributors',
    org: 'of Neuland Ingolstadt e.V.',
    links: [
      { icon: 'github', link: 'https://github.com/neuland-ingolstadt' },
      { icon: 'linkedin', link: 'https://linkedin.com/company/neuland-ingolstadt' },
      { icon: 'instagram', link: 'https://instagram.com/neuland_ingolstadt' }
    ]
  }
]
</script>

<VPTeamMembers size="small" :members="members" />
