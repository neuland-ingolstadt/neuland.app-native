# Entwickler

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/Robert27.png',
    name: 'Robert Eggl',
   logo: './assets/robert.png',
    title: 'Gründer & Projektleiter Neuland Next',
    links: [
      { icon: 'github', link: 'https://github.com/Robert27' },
    ]
  },
    {
    avatar: 'https://github.com/BuildmodeOne.png',
    name: 'Philipp Opheys',
    title: 'Projektleiter neuland.app',
    links: [
      { icon: 'github', link: 'https://github.com/BuildmodeOne' },
    ]
  },
  {
    avatar: 'https://github.com/alexhorn.png',
    name: 'Alexander Horn',
    title: 'Gründer neuland.app',
    links: [
      { icon: 'github', link: 'https://github.com/BuildmodeOne' },
    ]
  },
   {
    avatar: 'https://github.com/M4GNV5.png',
    name: 'Jakob Löw',
    title: 'Gründer neuland.app',
    links: [
      { icon: 'github', link: 'https://github.com/M4GNV5' },
    ]
  },
    {
    avatar: 'https://github.com/neuland-ingolstadt.png',
    name: 'und viele Weitere',
    org: 'von Neuland Ingolstadt e.V.',
    links: [
      { icon: 'github', link: 'https://github.com/neuland-ingolstadt' },
      { icon: 'linkedin', link: 'https://linkedin.com/neuland_ing' },
      { icon: 'instagram', link: 'https://instagram.com/neuland_ing' }
    ]
  },


]
</script>

<VPTeamMembers size="small" :members="members" />
