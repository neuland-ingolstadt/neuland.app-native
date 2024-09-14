---
outline: false
---

<script setup>
import { onMounted } from 'vue';
import  StoreLinksDe  from '../components/StoreLinksDe.vue';

function redirectBasedOnOS() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    window.location.href = "https://apps.apple.com/app/neuland-next/id1617096811";
  } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
    window.location.href = "https://apps.apple.com/app/neuland-next/id1617096811";
  } else if (/android/i.test(userAgent)) {
    window.location.href = "https://play.google.com/store/apps/details?id=app.neuland";
  } else {
    document.getElementById("links").style.display = "block";
  }
}

onMounted(() => {
  redirectBasedOnOS();
});
</script>

<style module>
.links {
  display: flex;
  justify-content: center;
  gap: 7.5px;
  margin-top: 50px;
  margin-bottom: 60px;
}

.links img {
  height: 50px;
  width: auto; 
}

</style>

# Neuland Next

#### Neuland Next ist verfügbar für iOS, Android und MacOS.

<StoreLinksDe />

::: tip Download
Falls du nicht automatisch weitergeleitet wirst, klicke bitte auf den entsprechenden Button oben oder besuche die [Download-Seite](/app/download) für weitere Informationen.
:::
\
Besuche unsere [Homepage](/) für mehr Informationen über Neuland Next und die Funktionen der App.
